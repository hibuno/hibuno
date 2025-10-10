import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { NodeSelection } from '@tiptap/pm/state';

export const DragHandle = Extension.create({
	name: 'dragHandle',

	addProseMirrorPlugins() {
		return [
			new Plugin({
				key: new PluginKey('dragHandle'),
				props: {
					decorations(state) {
						const { doc, selection } = state;
						const decorations: Decoration[] = [];

						doc.descendants((node, pos) => {
							if (
								node.isBlock &&
								node.type.name !== 'doc' &&
								node.type.name !== 'column' &&
								node.type.name !== 'columns'
							) {
								const decoration = Decoration.widget(pos, () => {
									const handle = document.createElement('div');
									handle.className =
										'drag-handle absolute left-0 -ml-6 opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10';
									handle.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-gray-400 hover:text-gray-600">
                      <path d="M7 4.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM13 4.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM7 11.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM13 11.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM7 18.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM13 18.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" fill="currentColor"/>
                    </svg>
                  `;
									handle.contentEditable = 'false';
									handle.draggable = true;

									// Add hover line for better UX
									const hoverLine = document.createElement('div');
									hoverLine.className = 'drag-hover-line absolute left-0 w-full h-0.5 bg-blue-500 opacity-0 transition-opacity pointer-events-none';
									hoverLine.style.top = '0px';

									handle.appendChild(hoverLine);

									handle.addEventListener('dragstart', (e) => {
										if (e.dataTransfer) {
											e.dataTransfer.effectAllowed = 'move';
											e.dataTransfer.setData('text/plain', pos.toString());

											// Select the node being dragged
											const tr = state.tr.setSelection(NodeSelection.create(state.doc, pos));
											state.selection = tr.selection;
										}
									});

									handle.addEventListener('dragend', (e) => {
										hoverLine.className = 'drag-hover-line absolute left-0 w-full h-0.5 bg-blue-500 opacity-0 transition-opacity pointer-events-none';
									});

									return handle;
								}, {
									side: -1,
								});

								decorations.push(decoration);
							}
						});

						return DecorationSet.create(doc, decorations);
					},
				},
				state: {
					init() {
						return { draggedNode: null };
					},
					apply(tr, state) {
						return { draggedNode: null };
					},
				},
			}),
		];
	},
});
