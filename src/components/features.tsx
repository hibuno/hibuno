import { Camera, FileImage, FileSearch, Clock, Shield, Smartphone } from "lucide-react"

export function Features() {
  const features = [
    {
      icon: <FileSearch className="h-10 w-10" />,
      title: "EXIF Data Extraction",
      description: "Extract all metadata from your images including camera settings, location, and timestamps.",
      color: "bg-[hsl(var(--teal))]",
    },
    {
      icon: <FileImage className="h-10 w-10" />,
      title: "AI Image Detection",
      description:
        "Determine if an image was created by AI or captured by a human with our advanced detection algorithms.",
      color: "bg-[hsl(var(--orange))]",
    },
    {
      icon: <Camera className="h-10 w-10" />,
      title: "Camera Identification",
      description: "Identify the camera model and settings used to capture the image.",
      color: "bg-[hsl(var(--purple))]",
    },
    {
      icon: <Clock className="h-10 w-10" />,
      title: "Temporary Storage",
      description: "Your images are automatically deleted after a few hours for your privacy.",
      color: "bg-[hsl(var(--mint))]",
    },
    {
      icon: <Shield className="h-10 w-10" />,
      title: "Fake Image Detection",
      description: "Verify the authenticity of images and detect potential manipulations.",
      color: "bg-[hsl(var(--coral))]",
    },
    {
      icon: <Smartphone className="h-10 w-10" />,
      title: "Mobile Friendly",
      description: "Analyze images on the go with our responsive mobile interface.",
      color: "bg-[hsl(var(--teal))]",
    },
  ]

  return (
    <section className="py-16 bg-white dark:bg-black">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="exifee-heading mb-4">Features</h2>
          <p className="text-xl max-w-2xl mx-auto">Discover everything Exifee can do for your images</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="exifee-card bg-white dark:bg-black p-6 flex flex-col items-center text-center">
              <div className={`rounded-full ${feature.color} p-4 mb-4 border-2 border-black`}>{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
