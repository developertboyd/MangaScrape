
# MangaScrape 
  
## Install  
1. Install `Node.js` >= 10.12.0 
3. Clone or Download this repo into a folder of your choice.
4. In the same directory as the package.json, run `npm install`

## Running
To run the script has a few arguments that `MUST` be passed.
```powershell 
node index.js {manga_name} {chapter_start_from} {max_chapters}
```
* Name of manga in the url
	* `https://mangakakalot.com/chapter/konjiki_no_gash/chapter_1`
		* The name would be `konjiki_no_gash`

* Chapter to start from
	* Which chapter will it start to download from (downloads 5 chapters at a time)
* Max chapters in the manga
	* This is to make sure you don't download more than there is. 

> This will create folders in the project with the folder names being the chapter numbers

### Example
`node index.js konjiki_no_gash 1 323` -> Will download chapters 1-5

`node index.js konjiki_no_gash 6 323` -> Will download chapters 6-10

`node index.js konjiki_no_gash 320 323` -> Will download chapters 320-323

## Special Chapters
### Coming Soon
