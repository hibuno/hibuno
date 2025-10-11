import { proxy } from 'valtio'

export interface CitationData {
	id: string
	text: string
	url: string
	pos?: number | undefined
	nodeType?: any
}

export interface FootnoteData {
	id: string
	text: string
	pos?: number | undefined
	nodeType?: any
}

export interface ImageData {
	src: string
	alt?: string
	caption?: string
	width?: string
	alignment?: 'left' | 'center' | 'right'
	pos?: number | undefined
	nodeType?: any
}

export interface LatexData {
	latex: string
	inline: boolean
	pos?: number | undefined
	nodeType?: any
}

export interface CommandMenuData {
	position: { top: number; left: number }
	insertPos?: number
}

export interface EditorDialogState {
	// Citation dialog
	citationDialog: {
		open: boolean
		data: CitationData | null
	}

	// Footnote dialog
	footnoteDialog: {
		open: boolean
		data: FootnoteData | null
	}

	// Image dialog
	imageDialog: {
		open: boolean
		data: ImageData | null
	}

	// LaTeX dialog
	latexDialog: {
		open: boolean
		data: LatexData | null
	}

	// Command menu
	commandMenu: {
		open: boolean
		data: CommandMenuData | null
	}
}

// Create the Valtio store
export const editorDialogState = proxy<EditorDialogState>({
	citationDialog: {
		open: false,
		data: null,
	},
	footnoteDialog: {
		open: false,
		data: null,
	},
	imageDialog: {
		open: false,
		data: null,
	},
	latexDialog: {
		open: false,
		data: null,
	},
	commandMenu: {
		open: false,
		data: null,
	},
})

// Action functions to update the state
export const editorDialogActions = {
	// Citation dialog actions
	openCitationDialog: (data: CitationData) => {
		editorDialogState.citationDialog = {
			open: true,
			data,
		}
	},

	closeCitationDialog: () => {
		editorDialogState.citationDialog = {
			open: false,
			data: null,
		}
	},

	// Footnote dialog actions
	openFootnoteDialog: (data: FootnoteData) => {
		editorDialogState.footnoteDialog = {
			open: true,
			data,
		}
	},

	closeFootnoteDialog: () => {
		editorDialogState.footnoteDialog = {
			open: false,
			data: null,
		}
	},

	// Image dialog actions
	openImageDialog: (data: ImageData) => {
		editorDialogState.imageDialog = {
			open: true,
			data,
		}
	},

	closeImageDialog: () => {
		editorDialogState.imageDialog = {
			open: false,
			data: null,
		}
	},

	// LaTeX dialog actions
	openLatexDialog: (data: LatexData) => {
		editorDialogState.latexDialog = {
			open: true,
			data,
		}
	},

	closeLatexDialog: () => {
		editorDialogState.latexDialog = {
			open: false,
			data: null,
		}
	},

	// Command menu actions
	openCommandMenu: (data: CommandMenuData) => {
		editorDialogState.commandMenu = {
			open: true,
			data,
		}
	},

	closeCommandMenu: () => {
		editorDialogState.commandMenu = {
			open: false,
			data: null,
		}
	},
}