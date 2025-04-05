
interface ScriptData {
  title: string;
  author: string;
  scenes: any[];
}

export const exportScriptToPDF = (scriptData: ScriptData): void => {
  let content = `
    <html>
      <head>
        <title>${scriptData.title}</title>
        <style>
          @media print {
            @page { margin: 1in; }
            body { margin: 0; }
            .page-break { page-break-before: always; }
          }
          body { 
            font-family: Courier, monospace; 
            line-height: 1.6; 
            font-size: 12pt;
            counter-reset: page;
          }
          .title-page {
            height: 11in;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
          }
          .title-page h1 { 
            font-size: 24pt; 
            margin-bottom: 1in;
          }
          .scene-page {
            min-height: 10in;
            position: relative;
          }
          .scene-heading { 
            font-weight: bold; 
            text-transform: uppercase; 
            margin-top: 20px; 
          }
          .scene-number {
            font-size: 12pt;
            color: #666;
            margin-bottom: 0.5in;
            font-weight: bold;
          }
          .action { margin: 10px 0; }
          .character { 
            margin-left: 20%; 
            margin-bottom: 0; 
            margin-top: 20px; 
            font-weight: bold; 
          }
          .dialogue { margin-left: 10%; margin-right: 20%; margin-bottom: 20px; }
          .parenthetical { margin-left: 15%; margin-bottom: 0; font-style: italic; }
          .transition { margin-left: 60%; font-weight: bold; margin-top: 20px; }
          .page-number {
            position: absolute;
            bottom: 0.5in;
            right: 0.5in;
            font-size: 12pt;
          }
          .page-number::after {
            counter-increment: page;
            content: counter(page);
          }
        </style>
      </head>
      <body>
        <div class="title-page">
          <h1>${scriptData.title}</h1>
          <p>by</p>
          <p style="font-weight: bold; font-size: 16pt;">${scriptData.author}</p>
        </div>
  `;
  
  // Start with a page break after the title
  content += `<div class="page-break"></div>`;
  
  // Each scene gets its own section
  scriptData.scenes.forEach((scene, sceneIndex) => {
    content += `
      <div class="scene-page">
        <div class="scene-number">SCENE ${sceneIndex + 1}</div>
    `;
    
    scene.elements.forEach((element: any) => {
      content += `<div class="${element.type}">${element.content}</div>`;
    });
    
    content += `
        <div class="page-number"></div>
      </div>
      ${sceneIndex < scriptData.scenes.length - 1 ? '<div class="page-break"></div>' : ''}
    `;
  });
  
  content += `
      </body>
    </html>
  `;
  
  const printIframe = document.createElement('iframe');
  printIframe.style.position = 'absolute';
  printIframe.style.top = '-9999px';
  document.body.appendChild(printIframe);
  
  const contentWindow = printIframe.contentWindow;
  if (contentWindow) {
    contentWindow.document.open();
    contentWindow.document.write(content);
    contentWindow.document.close();
    
    setTimeout(() => {
      contentWindow.focus();
      contentWindow.print();
      document.body.removeChild(printIframe);
    }, 250);
  }
};
