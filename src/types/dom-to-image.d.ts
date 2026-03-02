declare module 'dom-to-image' {
  export interface DomToImageOptions {
    filter?: (node: Node) => boolean;
    bgcolor?: string;
    style?: Record<string, string>;
  }

  export function toPng(node: Node, options?: DomToImageOptions): Promise<string>;

  const domToImage: {
    toPng: typeof toPng;
  };

  export default domToImage;
}
