/**
 * Custom link module for docxtemplater
 * Converts [[varName]] tags into real clickable hyperlinks
 */
export function createLinkModule() {
  return {
    name: 'link-module',
    // Called before rendering
    preparse: function(tag) {
      // Check if this is a link tag: [[varName]]
      if (tag.startsWith('[[') && tag.endsWith(']]')) {
        const varName = tag.slice(2, -2).trim();
        return {
          type: 'link',
          value: varName,
          raw: tag
        };
      }
      return tag;
    },
    
    // Called for each tag during render
    matchers: function() {
      return [
        {
          // Match [[varName]] syntax
          regex: /^\[\[([a-zA-Z0-9_]+)\]\]$/,
          type: 'link',
          replace: (match, options) => {
            const varName = match[1];
            const value = options.scope[varName];
            
            if (!value || !value.url) {
              return value?.text || '';
            }
            
            // Return an object that postProcess will handle
            return {
              text: value.text || value.url,
              url: value.url,
              isLink: true
            };
          }
        }
      ];
    },
    
    // Post-process: convert objects to hyperlink XML
    postprocess: function(parts) {
      return parts.map(part => {
        if (part && typeof part === 'object' && part.isLink) {
          // Return a special marker that we'll replace later
          return {
            type: 'placeholder',
            value: JSON.stringify({
              text: part.text,
              url: part.url
            })
          };
        }
        return part;
      });
    }
  };
}