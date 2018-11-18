var cheerio = require('cheerio')
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
var req = require('sync-request')
var fs = require('fs')
var ejs = require('ejs')
var moment = require('moment')
var uuidGenerator = require('./uuid.js')
var jszip = require('jszip')

var config = JSON.parse(fs.readFileSync('config.json', 'utf-8'))

function request(url) {

    return req('GET', url).getBody().toString();
}

function getToc(html, site)  {
    
    var $ = cheerio.load(html);
    
    if(site.remove)
        $(site.remove).remove()
    
    var $list = $(site.articles);

    var res = [];
    for(var i = 0; i < $list.length; i++)
    {
        var $link = $list.eq(i)
        var url = $link.attr('href');
        var text = $link.text();
        res.push({
            title: text,
            url: site.base + url,
        })
    }
    return res;
}

function getContent(html, site) {
    var $ = cheerio.load(html);
    
    if(site.remove)
        $(site.remove).remove()
    
    var co = $(site.content).toString() 
    if(!co) return  ''
    
    return co.replace(/&#x\w{4};/g, (s) => {
        var cc = s.slice(3, 7)
        cc = Number.parseInt(cc, 16)
        return String.fromCharCode(cc)
    });
}

function writeRss(articles, site) {
    
    console.log(`generating rss for site ${site.name}`)
    
    var temp = fs.readFileSync('assets/rss.ejs', 'utf-8')
    var data = Object.assign({}, site, {
        updated: moment().format('YYYY-MM-DDThh:mm:ss.SSS\\Z'),
        articles: articles,
        self: config.self,
    })
    var rss = ejs.render(temp, data)
    fs.writeFileSync(`out/${site.name}.xml`, rss)
}

function writeEpub(articles, site) {
    
    console.log(`generating epub for site ${site.name}`)
    
    var zip = new jszip();
    zip.file('mimetype', fs.readFileSync('./assets/mimetype'));
    zip.file('META-INF/container.xml', fs.readFileSync('./assets/container.xml'));
    zip.file('OEBPS/Styles/Style.css', fs.readFileSync('./assets/Style.css'));
    
    var articleTemp = ejs.compile(fs.readFileSync('assets/article.ejs', 'utf-8'))
    
    var toc = []
    for(var i = 0; i < articles.length; i++) {
        var article = articles[i]
        toc.push({
            file: `${i+1}.html`,
            title: article.title,
        })
        
        zip.file(`OEBPS/Text/${i+1}.html`, articleTemp(article));
    }
    
    var uuid = uuidGenerator.uuid();
    
    var opf = ejs.render(fs.readFileSync('assets/content.ejs', 'utf-8'), {
        date: moment().format('YYYY-MM-DD'),
        toc: toc,
        uuid: uuid,
        name: site.name,
    });
    zip.file('OEBPS/content.opf', opf);

    var ncx = ejs.render(fs.readFileSync('assets/toc.ejs', 'utf-8'), {
        toc: toc,
        uuid: uuid,
    });
    zip.file('OEBPS/toc.ncx', ncx);
    
    fs.writeFileSync(`out/${site.name}.epub`, zip.generate({type: 'nodebuffer', 'compression':'DEFLATE'}));
}

function genRss(site) {
    console.log(`processing site ${site.name}`)
    
    var html = request(site.url)
    var toc = getToc(html, site)
    var articles = []
    
    for(var elem of toc) {
        console.log(elem.url)
        html = request(elem.url)
        var co = getContent(html, site)
        if(!co) co = ''
        
        articles.push({
            url: elem.url,
            title: elem.title,
            content: co,
            summary: genSummary(co),
        })
    }
    
    writeRss(articles, site)
    if(site.epub) writeEpub(articles, site)
}

function genSummary(html) {
    
    return html.slice(0, 100)
        .replace(/<\/?[^>]+>/g, '') + '...'
    
}

function main() {
    
    try {fs.mkdirSync('out')} catch(ex){}
    
    for(var site of config.sites) {
        genRss(site)
    }
    
    console.log('done..')
}

if (require.main === module)
    main()