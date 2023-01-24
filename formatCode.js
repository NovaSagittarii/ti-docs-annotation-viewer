"use strict";

var code;
(async function(){
	code = await fetch("./ak8963.c").then(res => res.text());
	load(code);
})();

document.body.addEventListener('dragover', (event) => event.preventDefault());
document.body.addEventListener('drop', async (event) => {
	// console.log('File(s) dropped', event);
	event.preventDefault();
	for(const item of event.dataTransfer.items){
      if (item.kind === 'file') {
        const file = item.getAsFile();
        const filename = file.name;
        document.title = filename;
      	load(await file.text());
        break;
      }
    }
});

function load(sourceCode){
	while(document.body.lastElementChild) document.body.removeChild(document.body.lastElementChild);
	// turn into array with text, then comment, text pairs repeating.
	const segments = sourceCode.replace(new RegExp("(?: *//[^\n]*\n){2,}", "g"), (x) => `\x00${x}\x00`)
		.replace(/\r\n?/g, '\n')
		.replace(/\n/g, '\r\n')
		.split('\x00');
	const div = document.createElement('div');
	for(let i = 1; i < segments.length; i += 2){
		const segmentDiv = document.createElement('div');
		const [comment, code] = segments.slice(i, i+2).map(x => 
			x.split('\r\n')
				.filter(l=>l.replace(new RegExp('//\\**', 'g'), '').trim())
				.map(l => l.replace(new RegExp(' *//!?'), ''))
				.join('\r\n')
		);
		const [pre, [codeRaw, codeAnnotation]] = ['pre', 'code'].map(e => [...new Array(2)].map(() => document.createElement(e)));
		pre[0].append(codeRaw);
		pre[1].append(codeAnnotation);

		codeAnnotation.classList.add('language-plaintext');
		pre[1].classList.add('annotation');
		segmentDiv.classList.add('annotatedSegment');

		codeRaw.textContent = code;
		codeAnnotation.textContent = comment;
		segmentDiv.append(...pre);
		div.append(segmentDiv);
	}
	document.body.append(div);
	hljs.highlightAll();
}

