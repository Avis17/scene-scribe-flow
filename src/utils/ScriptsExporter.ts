
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
          body { font-family: Courier, monospace; margin: 60px; line-height: 1.6; }
          h1 { text-align: center; margin-bottom: 4px; }
          .author { text-align: center; margin-bottom: 50px; }
          .scene-heading { font-weight: bold; text-transform: uppercase; margin-top: 20px; }
          .action { margin: 10px 0; }
          .character { margin-left: 20%; margin-bottom: 0; margin-top: 20px; font-weight: bold; }
          .dialogue { margin-left: 10%; margin-right: 20%; margin-bottom: 20px; }
          .parenthetical { margin-left: 15%; margin-bottom: 0; font-style: italic; }
          .transition { margin-left: 60%; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <h1>${scriptData.title}</h1>
        <p class="author">by ${scriptData.author}</p>
  `;
  
  scriptData.scenes.forEach((scene: any) => {
    scene.elements.forEach((element: any) => {
      content += `<div class="${element.type}">${element.content}</div>`;
    });
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
