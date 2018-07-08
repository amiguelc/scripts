const puppeteer = require('puppeteer');

(async () => {
	// Viewport && Window size
	const width = 1600;
	const height = 1024;

	const browser = await puppeteer.launch({
		headless: false, 
		timeout: 0,
		args: [
		`--window-size=${ width },${ height }`
	],});
	
	const page = await browser.newPage();
	await page.setViewport({
		width: width,
		height: height,
	});

	await page.goto('https://www.google.es/', { waitUntil: 'networkidle0' });
	await page.waitFor(2000);
	
	await page.type('input[name=q]', 'cual es mi ip', { delay: 100 });
	//para evitar error de sugerencias
	await page.evaluate(() => {
		let dom = document.querySelector('ul.sbsb_b');
		dom.innerHTML = "";
	});
	await page.click('input[type="submit"]');
	await page.waitFor(4000);
	
	const links = await page.evaluate(() => {
		  return Array.from(document.querySelectorAll('h3 a'))
			.map(a => { return a.href })
	});
	pagina_google = 0;
	encontrado = false;
	while (encontrado==false){
		pagina_google += 1;
		const links = await page.evaluate(() => {
		  return Array.from(document.querySelectorAll('h3 a'))
			.map(a => { return a.href })
		})
		for (i = 0; i < links.length; i++) {
			if (encontrado==false && /http(s)?:\/\/ipweb.org\//g.test(links[i])){
				encontrado=true;				
				await console.log("Encontrado "+links[i]+" en la pagina: "+pagina_google);
				const enlace = await page.$("a[href='"+links[i]+"']");
				await page.evaluateHandle((el) => {
					el.target = '_self';
				}, enlace);
				await enlace.click("a[href='"+links[i]+"']");
				await page.waitFor(4000);
				await page.waitForSelector('#link_myip');
				await page.click("#link_myip");
			}
		}
		if (encontrado==false){
			try {
				const next = await page.$('#pnnext');
				await next.click();
				await page.waitForNavigation({waitUntil: 'load'});
				await page.waitFor(4000);		
			}catch (e){
				console.log("No encontrado. Fin");
				console.log(e);
				break;
			}
		}
	}
})();