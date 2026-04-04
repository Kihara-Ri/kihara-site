import type MarkdownIt from 'markdown-it';
import type { BlogMarkdownConfig, CustomPluginName } from '../markdown/configTypes';
import { annotationPlugin } from './annotationPlugin';
import { attachPlugin } from './attachPlugin';
import { citationPlugin } from './citationPlugin';
import { furiganaPlugin } from './furiganaPlugin';
import { headingAnchorPlugin } from './headingAnchorPlugin';
import { linkIconPlugin } from './linkIconPlugin';

const customPluginRegistry: Record<CustomPluginName, (md: MarkdownIt) => void> = {
  annotation: annotationPlugin,
  attach: attachPlugin,
  citation: citationPlugin,
  furigana: furiganaPlugin,
  headingAnchor: headingAnchorPlugin,
  linkIcon: linkIconPlugin,
};

export function applyCustomPlugins(md: MarkdownIt, config: BlogMarkdownConfig): void {
  for (const plugin of config.plugins) {
    if (!plugin.enabled) {
      continue;
    }

    customPluginRegistry[plugin.name](md);
  }
}
