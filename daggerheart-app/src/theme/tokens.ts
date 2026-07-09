// Typed mirror of tokens.css for programmatic use (charts, canvas, logic).
export const DOMAINS = ['arcana','blade','bone','codex','grace','midnight','sage','splendor','valor'] as const;
export type Domain = typeof DOMAINS[number];

export const domainColor: Record<Domain,string> = {
  arcana:'#7b46c9', blade:'#b0402f', bone:'#9a8c6e', codex:'#3f7bc9', grace:'#c94f93',
  midnight:'#3a3550', sage:'#3f9b54', splendor:'#caa23a', valor:'#c97a2f',
};
export const resource = {
  hp:{fill:'#e23b3e',edge:'#7c1c1f'}, stress:{fill:'#f0a52e',edge:'#9c560f'},
  armor:{fill:'#46c0ae',edge:'#216b60'}, hope:{fill:'#e9c772',edge:'#a8832f'},
} as const;
export type ResourceKind = keyof typeof resource;
