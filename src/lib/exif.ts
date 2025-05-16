import * as exifr from "exifr"

export async function extractExifData(buffer: Buffer) {
	try {
		// Default values in case EXIF data is missing
		const defaultData = {
			camera: {
				make: "Unknown",
				model: "Unknown",
				software: "Unknown",
			},
			image: {
				width: 0,
				height: 0,
				orientation: 1,
				colorSpace: "Unknown",
			},
			exif: {
				exposureTime: "Unknown",
				fNumber: 0,
				iso: 0,
				focalLength: "Unknown",
				flash: "No Flash",
				dateTimeOriginal: new Date().toISOString(),
			},
			gps: {
				latitude: null,
				longitude: null,
				altitude: null,
			},
			advanced: {
				lensModel: "Unknown",
				lensInfo: "Unknown",
				meteringMode: "Unknown",
				whiteBalance: "Unknown",
				exposureProgram: "Unknown",
				exposureMode: "Unknown",
				sceneCaptureType: "Unknown",
				digitalZoomRatio: 0,
				contrast: "Unknown",
				saturation: "Unknown",
				sharpness: "Unknown",
				subjectDistance: "Unknown",
			},
		}

		// Parse EXIF data using exifr
		// First, try to get all available data
		const fullExif = await exifr.parse(buffer, { xmp: true, iptc: true, icc: true, jfif: true, ihdr: true })

		// If no EXIF data was found, return default values
		if (!fullExif) {
			console.log("No EXIF data found in image")
			return defaultData
		}

		console.log("Full EXIF data:", JSON.stringify(fullExif).substring(0, 500) + "...")

		// Extract GPS data specifically
		const gps = await exifr.gps(buffer).catch(() => null)

		// Extract thumbnail if available
		const thumbnail = await exifr.thumbnail(buffer).catch(() => null)

		// Extract camera information
		const make = fullExif.Make || fullExif.make || defaultData.camera.make
		const model = fullExif.Model || fullExif.model || defaultData.camera.model
		const software = fullExif.Software || fullExif.software || defaultData.camera.software

		// Extract image information
		const width = fullExif.ImageWidth || fullExif.ExifImageWidth || fullExif.width || defaultData.image.width
		const height = fullExif.ImageHeight || fullExif.ExifImageHeight || fullExif.height || defaultData.image.height
		const orientation = fullExif.Orientation || fullExif.orientation || defaultData.image.orientation

		// Try to determine color space
		let colorSpace = fullExif.ColorSpace || fullExif.colorSpace || null
		if (colorSpace === 1) {
			colorSpace = "sRGB"
		} else if (colorSpace === 2) {
			colorSpace = "Adobe RGB"
		} else {
			colorSpace = defaultData.image.colorSpace
		}

		// Extract EXIF specific information
		const exposureTime = formatExposureTime(fullExif.ExposureTime || fullExif.exposureTime)
		const fNumber = fullExif.FNumber || fullExif.fNumber || defaultData.exif.fNumber
		const iso = fullExif.ISO || fullExif.ISOSpeedRatings || fullExif.iso || defaultData.exif.iso

		// Format focal length
		let focalLength = fullExif.FocalLength || fullExif.focalLength || defaultData.exif.focalLength
		if (typeof focalLength === "number") {
			focalLength = `${Math.round(focalLength)}mm`
		}

		// Determine flash status
		let flash = fullExif.Flash || fullExif.flash
		if (flash === 0) {
			flash = "No Flash"
		} else if (flash === 1) {
			flash = "Flash Fired"
		} else if (typeof flash === "object" && flash.fired === false) {
			flash = "No Flash"
		} else if (typeof flash === "object" && flash.fired === true) {
			flash = "Flash Fired"
		} else {
			flash = defaultData.exif.flash
		}

		// Extract date information
		let dateTimeOriginal = fullExif.DateTimeOriginal || fullExif.CreateDate || fullExif.DateTime || fullExif.ModifyDate

		// If date is in EXIF format, convert to ISO format
		if (typeof dateTimeOriginal === "string") {
			try {
				dateTimeOriginal = new Date(dateTimeOriginal).toISOString()
			} catch (e) {
				console.warn("Error parsing date:", e)
				dateTimeOriginal = defaultData.exif.dateTimeOriginal
			}
		} else if (dateTimeOriginal instanceof Date) {
			dateTimeOriginal = dateTimeOriginal.toISOString()
		} else {
			dateTimeOriginal = defaultData.exif.dateTimeOriginal
		}

		// Extract GPS information
		let latitude = null
		let longitude = null

		if (gps) {
			latitude = gps.latitude
			longitude = gps.longitude
			// Note: gps.altitude might not exist in the GpsOutput type
			// We'll get altitude from fullExif instead
		}

		// Extract advanced information
		const lensModel = fullExif.LensModel || fullExif.lensModel || defaultData.advanced.lensModel
		const lensInfo = fullExif.LensInfo || fullExif.lensInfo || defaultData.advanced.lensInfo
		const meteringMode = interpretMeteringMode(fullExif.MeteringMode || fullExif.meteringMode)
		const whiteBalance = interpretWhiteBalance(fullExif.WhiteBalance || fullExif.whiteBalance)
		const exposureProgram = interpretExposureProgram(fullExif.ExposureProgram || fullExif.exposureProgram)
		const exposureMode = interpretExposureMode(fullExif.ExposureMode || fullExif.exposureMode)
		const sceneCaptureType = interpretSceneCaptureType(fullExif.SceneCaptureType || fullExif.sceneCaptureType)
		const digitalZoomRatio =
			fullExif.DigitalZoomRatio || fullExif.digitalZoomRatio || defaultData.advanced.digitalZoomRatio
		const contrast = interpretContrastSetting(fullExif.Contrast || fullExif.contrast)
		const saturation = interpretSaturationSetting(fullExif.Saturation || fullExif.saturation)
		const sharpness = interpretSharpnessSetting(fullExif.Sharpness || fullExif.sharpness)
		const subjectDistance = fullExif.SubjectDistance || fullExif.subjectDistance || defaultData.advanced.subjectDistance

		// Return the extracted EXIF data in our expected format
		return {
			camera: {
				make,
				model,
				software,
			},
			image: {
				width,
				height,
				orientation,
				colorSpace,
				hasThumbnail: !!thumbnail,
			},
			exif: {
				exposureTime: exposureTime,
				fNumber,
				iso,
				focalLength,
				flash,
				dateTimeOriginal,
				shutterSpeedValue: fullExif.ShutterSpeedValue || fullExif.shutterSpeedValue || null,
				apertureValue: fullExif.ApertureValue || fullExif.apertureValue || null,
				brightnessValue: fullExif.BrightnessValue || fullExif.brightnessValue || null,
				exposureCompensation: fullExif.ExposureCompensation || fullExif.exposureCompensation || null,
				maxApertureValue: fullExif.MaxApertureValue || fullExif.maxApertureValue || null,
				subjectDistance: fullExif.SubjectDistance || fullExif.subjectDistance || null,
				focalLengthIn35mmFormat: fullExif.FocalLengthIn35mmFormat || fullExif.focalLengthIn35mmFormat || null,
				exifVersion: fullExif.ExifVersion || fullExif.exifVersion || null,
				flashpixVersion: fullExif.FlashpixVersion || fullExif.flashpixVersion || null,
				sensingMethod: fullExif.SensingMethod || fullExif.sensingMethod || null,
				sceneType: fullExif.SceneType || fullExif.sceneType || null,
				customRendered: fullExif.CustomRendered || fullExif.customRendered || null,
			},
			gps: {
				latitude,
				longitude,
				// Fix the lint error by getting altitude from fullExif instead of gps object
				altitude: fullExif.GPSAltitude || fullExif.gpsAltitude || null,
				latitudeRef: fullExif.GPSLatitudeRef || fullExif.gpsLatitudeRef || null,
				longitudeRef: fullExif.GPSLongitudeRef || fullExif.gpsLongitudeRef || null,
				altitudeRef: fullExif.GPSAltitudeRef || fullExif.gpsAltitudeRef || null,
				timeStamp: fullExif.GPSTimeStamp || fullExif.gpsTimeStamp || null,
				dateStamp: fullExif.GPSDateStamp || fullExif.gpsDateStamp || null,
				processingMethod: fullExif.GPSProcessingMethod || fullExif.gpsProcessingMethod || null,
				versionID: fullExif.GPSVersionID || fullExif.gpsVersionID || null,
				DOP: fullExif.GPSDOP || fullExif.gpsDOP || null,
			},
			advanced: {
				lensModel,
				lensInfo,
				meteringMode,
				whiteBalance,
				exposureProgram,
				exposureMode,
				sceneCaptureType,
				digitalZoomRatio,
				contrast,
				saturation,
				sharpness,
				subjectDistance,
			},
			// Additional data sections
			thumbnail: thumbnail,
			icc: fullExif.ICC || fullExif.icc || null,
			xmp: fullExif.XMP || fullExif.xmp || null,
			iptc: fullExif.IPTC || fullExif.iptc || null,
			jfif: fullExif.JFIF || fullExif.jfif || null,
			ihdr: fullExif.IHDR || fullExif.ihdr || null,
			makerNote: fullExif.MakerNote || fullExif.makerNote || null,
			userComment: fullExif.UserComment || fullExif.userComment || null,
			// Include the raw data for debugging or advanced usage
			rawExif: fullExif,
		}
	} catch (error) {
		console.error("EXIF extraction error:", error)
		// Return default values if extraction fails
		return {
			camera: {
				make: "Unknown",
				model: "Unknown",
				software: "Unknown",
			},
			image: {
				width: 0,
				height: 0,
				orientation: 1,
				colorSpace: "Unknown",
			},
			exif: {
				exposureTime: "Unknown",
				fNumber: 0,
				iso: 0,
				focalLength: "Unknown",
				flash: "No Flash",
				dateTimeOriginal: new Date().toISOString(),
			},
			gps: {
				latitude: null,
				longitude: null,
				altitude: null,
			},
			advanced: {
				lensModel: "Unknown",
				lensInfo: "Unknown",
				meteringMode: "Unknown",
				whiteBalance: "Unknown",
				exposureProgram: "Unknown",
				exposureMode: "Unknown",
				sceneCaptureType: "Unknown",
				digitalZoomRatio: 0,
				contrast: "Unknown",
				saturation: "Unknown",
				sharpness: "Unknown",
				subjectDistance: "Unknown",
			},
		}
	}
}

// Helper function to format exposure time as a fraction
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatExposureTime(exposureTime: any): string {
	if (!exposureTime) return "Unknown"

	if (typeof exposureTime === "number") {
		if (exposureTime < 1) {
			const denominator = Math.round(1 / exposureTime)
			return `1/${denominator}`
		}
		return `${exposureTime}`
	}

	return String(exposureTime)
}

// Helper functions to interpret EXIF values
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function interpretMeteringMode(mode: any): string {
	if (mode === undefined || mode === null) return "Unknown"

	const meteringModes: Record<number, string> = {
		0: "Unknown",
		1: "Average",
		2: "Center-weighted average",
		3: "Spot",
		4: "Multi-spot",
		5: "Pattern",
		6: "Partial",
		255: "Other",
	}

	return typeof mode === "number" && mode in meteringModes ? meteringModes[mode] : String(mode)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function interpretWhiteBalance(wb: any): string {
	if (wb === undefined || wb === null) return "Unknown"

	if (wb === 0) return "Auto"
	if (wb === 1) return "Manual"

	return String(wb)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function interpretExposureProgram(program: any): string {
	if (program === undefined || program === null) return "Unknown"

	const programs: Record<number, string> = {
		0: "Not defined",
		1: "Manual",
		2: "Normal program",
		3: "Aperture priority",
		4: "Shutter priority",
		5: "Creative program",
		6: "Action program",
		7: "Portrait mode",
		8: "Landscape mode",
	}

	return typeof program === "number" && program in programs ? programs[program] : String(program)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function interpretExposureMode(mode: any): string {
	if (mode === undefined || mode === null) return "Unknown"

	const modes: Record<number, string> = {
		0: "Auto exposure",
		1: "Manual exposure",
		2: "Auto bracket",
	}

	return typeof mode === "number" && mode in modes ? modes[mode] : String(mode)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function interpretSceneCaptureType(type: any): string {
	if (type === undefined || type === null) return "Unknown"

	const types: Record<number, string> = {
		0: "Standard",
		1: "Landscape",
		2: "Portrait",
		3: "Night scene",
	}

	return typeof type === "number" && type in types ? types[type] : String(type)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function interpretContrastSetting(contrast: any): string {
	if (contrast === undefined || contrast === null) return "Unknown"

	const settings: Record<number, string> = {
		0: "Normal",
		1: "Soft",
		2: "Hard",
	}

	return typeof contrast === "number" && contrast in settings ? settings[contrast] : String(contrast)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function interpretSaturationSetting(saturation: any): string {
	if (saturation === undefined || saturation === null) return "Unknown"

	const settings: Record<number, string> = {
		0: "Normal",
		1: "Low saturation",
		2: "High saturation",
	}

	return typeof saturation === "number" && saturation in settings ? settings[saturation] : String(saturation)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function interpretSharpnessSetting(sharpness: any): string {
	if (sharpness === undefined || sharpness === null) return "Unknown"

	const settings: Record<number, string> = {
		0: "Normal",
		1: "Soft",
		2: "Hard",
	}

	return typeof sharpness === "number" && sharpness in settings ? settings[sharpness] : String(sharpness)
}
