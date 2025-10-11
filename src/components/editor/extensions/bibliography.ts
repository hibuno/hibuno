import { mergeAttributes, Node } from "@tiptap/core";

export interface BibliographyOptions {
	HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		bibliography: {
			setCitation: (options: {
				id: string;
				text: string;
				url?: string;
			}) => ReturnType;
			setFootnote: (options: { id: string; text: string }) => ReturnType;
			setBibliography: () => ReturnType;
		};
	}
}

// Citation Node
export const Citation = Node.create({
	name: "citation",

	group: "inline",

	inline: true,

	atom: true,

	addAttributes() {
		return {
			id: {
				default: "",
				parseHTML: (element: Element) =>
					element.getAttribute("data-citation-id"),
				renderHTML: (attributes: any) => {
					return {
						"data-citation-id": attributes.id,
					};
				},
			},
			text: {
				default: "",
				parseHTML: (element: Element) =>
					element.getAttribute("data-citation-text"),
				renderHTML: (attributes: any) => {
					return {
						"data-citation-text": attributes.text,
					};
				},
			},
			url: {
				default: "",
				parseHTML: (element: Element) =>
					element.getAttribute("data-citation-url"),
				renderHTML: (attributes: any) => {
					return {
						"data-citation-url": attributes.url,
					};
				},
			},
		};
	},

	parseHTML() {
		return [
			{
				tag: "span[data-citation-id]",
			},
		];
	},

	renderHTML({ HTMLAttributes }: { HTMLAttributes: any }) {
		const id = HTMLAttributes["data-citation-id"] || "";
		const text = HTMLAttributes["data-citation-text"] || "";

		return [
			"span",
			mergeAttributes(HTMLAttributes, {
				class:
					"citation inline-block bg-blue-100 text-blue-800 px-1 py-0.5 rounded text-xs font-medium cursor-pointer hover:bg-blue-200 transition-colors",
				"data-citation-id": id,
				"data-citation-text": text,
				title: text,
			}),
			`[${id}]`,
		];
	},

	addCommands() {
		return {
			setCitation:
				(options: { id: string; text: string; url?: string }) =>
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
			const dom = document.createElement("span");
			dom.className =
				"citation inline-block bg-blue-100 text-blue-800 px-1 py-0.5 rounded text-xs font-medium cursor-pointer hover:bg-blue-200 transition-colors";
			dom.setAttribute("data-citation-id", node.attrs.id);
			dom.setAttribute("data-citation-text", node.attrs.text);
			dom.textContent = `[${node.attrs.id}]`;
			dom.title = node.attrs.text;

			// Add click handler for editing
			dom.addEventListener("click", (e) => {
				e.preventDefault();
				e.stopPropagation();

				// Dispatch custom event to trigger citation dialog in main editor
				const editEvent = new CustomEvent("editCitation", {
					detail: {
						id: node.attrs.id || "",
						text: node.attrs.text || "",
						url: node.attrs.url || "",
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

					dom.setAttribute("data-citation-id", updatedNode.attrs.id);
					dom.setAttribute("data-citation-text", updatedNode.attrs.text);
					dom.textContent = `[${updatedNode.attrs.id}]`;
					dom.title = updatedNode.attrs.text;
					return true;
				},
			};
		};
	},
});

// Footnote Node
export const Footnote = Node.create({
	name: "footnote",

	group: "inline",

	inline: true,

	atom: true,

	addAttributes() {
		return {
			id: {
				default: "",
				parseHTML: (element: Element) =>
					element.getAttribute("data-footnote-id"),
				renderHTML: (attributes: any) => {
					return {
						"data-footnote-id": attributes.id,
					};
				},
			},
			text: {
				default: "",
				parseHTML: (element: Element) =>
					element.getAttribute("data-footnote-text"),
				renderHTML: (attributes: any) => {
					return {
						"data-footnote-text": attributes.text,
					};
				},
			},
		};
	},

	parseHTML() {
		return [
			{
				tag: "sup[data-footnote-id]",
			},
		];
	},

	renderHTML({ HTMLAttributes }: { HTMLAttributes: any }) {
		const id = HTMLAttributes["data-footnote-id"] || "";

		return [
			"sup",
			mergeAttributes(HTMLAttributes, {
				class:
					"footnote text-blue-600 cursor-pointer hover:text-blue-800 font-medium",
				"data-footnote-id": id,
			}),
			id,
		];
	},

	addCommands() {
		return {
			setFootnote:
				(options: { id: string; text: string }) =>
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
			const dom = document.createElement("sup");
			dom.className =
				"footnote text-blue-600 cursor-pointer hover:text-blue-800 font-medium";
			dom.setAttribute("data-footnote-id", node.attrs.id);
			dom.setAttribute("data-footnote-text", node.attrs.text);
			dom.textContent = node.attrs.id;
			dom.title = node.attrs.text;

			// Add click handler for editing
			dom.addEventListener("click", (e) => {
				e.preventDefault();
				e.stopPropagation();

				// Dispatch custom event to trigger footnote dialog in main editor
				const editEvent = new CustomEvent("editFootnote", {
					detail: {
						id: node.attrs.id || "",
						text: node.attrs.text || "",
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

					dom.setAttribute("data-footnote-id", updatedNode.attrs.id);
					dom.setAttribute("data-footnote-text", updatedNode.attrs.text);
					dom.textContent = updatedNode.attrs.id;
					dom.title = updatedNode.attrs.text;
					return true;
				},
			};
		};
	},
});

// Bibliography Node
export const Bibliography = Node.create({
	name: "bibliography",

	group: "block",

	content: "",

	marks: "",

	atom: true,

	parseHTML() {
		return [
			{
				tag: "div[data-bibliography]",
			},
		];
	},

	renderHTML({ HTMLAttributes }: { HTMLAttributes: any }) {
		return [
			"div",
			mergeAttributes(HTMLAttributes, {
				class: "bibliography mt-8 pt-4 border-t border-gray-300",
				"data-bibliography": "true",
			}),
			[
				"h3",
				{ class: "text-lg font-semibold mb-4 text-gray-900" },
				"References",
			],
			[
				"div",
				{ class: "bibliography-list space-y-2" },
				"Bibliography will be automatically generated here based on citations.",
			],
		];
	},

	addCommands() {
		return {
			setBibliography:
				() =>
					({ commands }: { commands: any }) => {
						return commands.insertContent({
							type: this.name,
						});
					},
		};
	},

	addNodeView() {
		return ({
			node: _node,
			getPos: _getPos,
			editor,
		}: {
			node: any;
			getPos: () => number | undefined;
			editor: any;
		}) => {
			const dom = document.createElement("div");
			dom.className = "bibliography mt-8 pt-4 border-t border-gray-300";
			dom.setAttribute("data-bibliography", "true");

			const title = document.createElement("h3");
			title.className = "text-lg font-semibold mb-4 text-gray-900";
			title.textContent = "References";

			const list = document.createElement("div");
			list.className = "bibliography-list space-y-2";

			const updateBibliography = () => {
				// Clear existing content
				list.innerHTML = "";

				// Find all citations in the document
				const citations = new Map();
				const doc = editor.state.doc;

				doc.descendants((node: any) => {
					if (node.type.name === "citation") {
						citations.set(node.attrs.id, {
							text: node.attrs.text,
							url: node.attrs.url,
						});
					}
				});

				if (citations.size === 0) {
					list.innerHTML =
						'<p class="text-gray-500 italic">No citations found. Add citations to see them here.</p>';
				} else {
					// Sort citations by ID
					const sortedCitations = Array.from(citations.entries()).sort(
						([a], [b]) => a.localeCompare(b),
					);

					sortedCitations.forEach(([id, data]) => {
						const item = document.createElement("div");
						item.className = "bibliography-item text-sm text-gray-700";

						const idSpan = document.createElement("span");
						idSpan.className = "font-medium text-blue-600";
						idSpan.textContent = `[${id}] `;

						const textSpan = document.createElement("span");
						textSpan.textContent = data.text;

						item.appendChild(idSpan);
						item.appendChild(textSpan);

						if (data.url) {
							const link = document.createElement("a");
							link.href = data.url;
							link.className = "text-blue-600 hover:text-blue-800 ml-2";
							link.textContent = "↗";
							link.target = "_blank";
							item.appendChild(link);
						}

						list.appendChild(item);
					});
				}
			};

			// Initial update
			updateBibliography();

			// Listen for document changes to update bibliography
			editor.on("update", updateBibliography);

			dom.appendChild(title);
			dom.appendChild(list);

			return {
				dom,
				update: () => {
					updateBibliography();
					return true;
				},
				destroy: () => {
					editor.off("update", updateBibliography);
				},
			};
		};
	},
});
