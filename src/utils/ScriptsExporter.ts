
interface ScriptData {
  id: string;
  title: string;
  author: string;
  scenes: any[];
}

export const exportScriptToPDF = (scriptData: ScriptData): void => {
  // Create a single HTML document containing both title page and script content
  const combinedContent = `
    <html>
      <head>
        <title>${scriptData.title}</title>
        <style>
          @media print {
            @page { 
              size: letter;
              margin: 1in; 
            }
            body { margin: 0; }
            .avoid-break { page-break-inside: avoid; }
            .page-break { page-break-before: always; }
          }
          body { 
            font-family: Courier, monospace; 
            font-size: 12pt;
            line-height: 1.6;
          }
          .title-page {
            height: 11in;
            position: relative;
            page-break-after: always;
          }
          .title-wrapper {
            position: absolute;
            left: 0;
            right: 0;
            top: 33%;
            text-align: center;
          }
          .title { 
            font-size: 24pt;
            text-transform: uppercase;
            margin-bottom: 1in;
          }
          .author-section {
            text-align: center;
            margin-top: 0.5in;
          }
          .script-content {
            position: relative;
            counter-reset: page 1;
          }
          .page-number {
            position: absolute;
            top: 0.5in;
            right: 0.5in;
            font-size: 12pt;
          }
          .page-number::after {
            counter-increment: page;
            content: counter(page);
          }
          .script-page {
            margin-left: 1.5in;
            margin-right: 1in;
          }
          .scene-heading { 
            font-weight: bold; 
            text-transform: uppercase; 
            margin-top: 20px; 
          }
          .action { 
            margin: 10px 0; 
          }
          .character { 
            margin-left: 4.2in; 
            margin-right: auto;
            width: 3in;
            text-align: center;
            margin-bottom: 0; 
            margin-top: 20px; 
            font-weight: bold; 
            text-transform: uppercase;
          }
          .dialogue { 
            margin-left: auto; 
            margin-right: auto;
            width: 2.9in;
            text-align: left;
            margin-bottom: 20px; 
          }
          .parenthetical { 
            margin-left: auto; 
            margin-right: auto;
            width: 2in;
            text-align: center;
            margin-bottom: 0; 
            font-style: italic; 
          }
          .transition { 
            margin-left: 60%; 
            font-weight: bold; 
            margin-top: 20px; 
          }
          .scene-number {
            font-weight: bold;
            margin-bottom: 10px;
            margin-top: 30px; /* Added space after each scene */
          }
        </style>
      </head>
      <body>
        <!-- Title Page -->
        <div class="title-page">
          <div class="title-wrapper">
            <div class="title">${scriptData.title}</div>
            <div>Written by</div>
            <div class="author-section">${scriptData.author}</div>
          </div>
        </div>
        
        <!-- Script Content -->
        <div class="script-content script-page">
          <div class="page-number"></div>
  `;
  
  // Add script content, scene by scene
  let contentWithScenes = combinedContent;
  
  scriptData.scenes.forEach((scene, sceneIndex) => {
    contentWithScenes += `
      <div class="scene-number avoid-break">SCENE ${sceneIndex + 1}</div>
    `;
    
    scene.elements.forEach((element: any) => {
      let elementClass = element.type;
      let content = element.content;
      
      // Special formatting for different element types
      switch(element.type) {
        case 'scene-heading':
          content = content.toUpperCase();
          break;
        case 'character':
          content = content.toUpperCase();
          break;
        case 'parenthetical':
          if (!content.startsWith('(') && !content.endsWith(')')) {
            content = `(${content})`;
          }
          break;
      }
      
      contentWithScenes += `<div class="${elementClass} avoid-break">${content}</div>`;
    });
  });
  
  contentWithScenes += `
        </div>
      </body>
    </html>
  `;
  
  // Create and print a single iframe with the combined content
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.top = '-9999px';
  document.body.appendChild(iframe);
  
  const contentWindow = iframe.contentWindow;
  if (contentWindow) {
    contentWindow.document.open();
    contentWindow.document.write(contentWithScenes);
    contentWindow.document.close();
    
    // Wait for all content to load then print
    setTimeout(() => {
      // Set the filename with the screenplay title
      const fileName = `${scriptData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_scriptly.pdf`;
      
      // For browsers that support it, set the filename
      if ((contentWindow as any).document.title) {
        (contentWindow as any).document.title = fileName;
      }
      
      contentWindow.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 500);
    }, 500);
  }
};
