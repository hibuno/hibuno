import { mergeAttributes, Node } from "@tiptap/core";
// import { ReactNodeViewRenderer } from "@tiptap/react";
import katex from "katex";

export interface MathLatexOptions {
	HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		mathLatex: {
			setMathLatex: (options: {
				latex: string;
				inline?: boolean;
			}) => ReturnType;
		};
	}
}

export const MathLatex = Node.create<MathLatexOptions>({
	name: "mathLatex",

	addOptions() {
		return {
			HTMLAttributes: {},
		};
	},

	group: "block",

	content: "",

	marks: "",

	atom: true,

	addAttributes() {
		return {
			latex: {
				default: "",
				parseHTML: (element: Element) => element.getAttribute("data-latex"),
				renderHTML: (attributes: any) => {
					if (!attributes.latex) return {};
					return {
						"data-latex": attributes.latex,
					};
				},
			},
			inline: {
				default: false,
				parseHTML: (element: Element) =>
					element.getAttribute("data-inline") === "true",
				renderHTML: (attributes: any) => {
					return {
						"data-inline": attributes.inline,
					};
				},
			},
		};
	},

	parseHTML() {
		return [
			{
				tag: "div[data-latex]",
			},
			{
				tag: "span[data-latex]",
			},
		];
	},

	renderHTML({ HTMLAttributes }: { HTMLAttributes: any }) {
		const latex = HTMLAttributes["data-latex"] || "";
		const inline = HTMLAttributes["data-inline"] === "true";

		const tag = inline ? "span" : "div";
		const className = inline ? "math-latex-inline" : "math-latex-block";

		// Render LaTeX with KaTeX for HTML output
		let content = latex;
		if (latex) {
			try {
				content = katex.renderToString(latex, {
					displayMode: !inline,
					throwOnError: false,
					errorColor: "#cc0000",
					strict: "warn" as const,
				});
			} catch (err) {
				console.warn("KaTeX HTML render error:", err);
				content = latex;
			}
		} else {
			content = "Enter LaTeX formula...";
		}

		return [
			tag,
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
				class: `${className} math-latex-rendered`,
				"data-latex": latex,
				"data-inline": inline,
			}),
			content,
		];
	},

	addCommands() {
		return {
			setMathLatex:
				(options: { latex: string; inline?: boolean }) =>
					({ commands }: { commands: any }) => {
						return commands.insertContent({
							type: this.name,
							attrs: options,
						});
					},
		};
	},

	addNodeView() {
		return ({
			node,
			getPos,
			editor: _editor,
		}: {
			node: any;
			getPos: () => number | undefined;
			editor: any;
		}) => {
			const dom = document.createElement(node.attrs.inline ? "span" : "div");
			dom.className = `math-latex ${node.attrs.inline ? "math-latex-inline" : "math-latex-block"} bg-gray-50 border border-gray-200 rounded px-2 py-1 font-mono text-sm cursor-pointer hover:bg-gray-100 transition-colors`;
			dom.setAttribute("data-latex", node.attrs.latex);
			dom.setAttribute("data-inline", node.attrs.inline);

			const renderLatex = () => {
				const latex = node.attrs.latex;
				if (latex) {
					try {
						// Use KaTeX to render the LaTeX formula
						const options = {
							displayMode: !node.attrs.inline,
							throwOnError: false,
							errorColor: "#cc0000",
							strict: "warn" as const,
						};

						// Render with KaTeX
						const renderedHTML = katex.renderToString(latex, options);

						// Set the rendered HTML
						dom.innerHTML = renderedHTML;

						// Store the rendered HTML in a data attribute for saving to database
						dom.setAttribute("data-rendered-html", renderedHTML);
					} catch (err) {
						console.warn("KaTeX rendering error:", err);
						// Fallback to showing LaTeX syntax with error styling
						dom.innerHTML = `<span class="text-red-500 bg-red-50 px-2 py-1 rounded text-xs font-mono">${node.attrs.inline ? `$${latex}$` : `$$${latex}$$`}</span>`;
						dom.setAttribute("data-rendered-html", dom.innerHTML);
					}
				} else {
					dom.textContent = "Enter LaTeX formula...";
					dom.classList.add("text-gray-400");
					dom.removeAttribute("data-rendered-html");
				}
			};

			renderLatex();

			// Add click handler for editing
			dom.addEventListener("click", (e) => {
				e.preventDefault();
				e.stopPropagation();

				// Dispatch custom event to trigger LaTeX dialog in main editor
				const editEvent = new CustomEvent("editMathLatex", {
					detail: {
						latex: node.attrs.latex || "",
						inline: node.attrs.inline || false,
						pos: getPos(),
						nodeType: node.type,
					},
					bubbles: true,
				});
				document.dispatchEvent(editEvent);
			});

			return {
				dom,
				update: (updatedNode: any) => {
					if (updatedNode.type !== node.type) {
						return false;
					}

					// Update the node reference
					Object.assign(node, updatedNode);
					renderLatex();
					return true;
				},
			};
		};
	},
});
