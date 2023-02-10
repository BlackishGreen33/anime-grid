const htmlEl = document.documentElement;

const Caches = {};
const get = async (url)=>{

    if(Caches[url]) return Caches[url];
    htmlEl.setAttribute('data-no-touch',true);
    const f = await fetch(url);
    const data = await f.json();
    Caches[url] = data;
    htmlEl.setAttribute('data-no-touch',false);
    return data;
}




const Images = {};

const loadImage = (src,onOver)=>{
    if(Images[src]) return onOver(Images[src]);
    const el = new Image();
    el.crossOrigin = 'Anonymous';
    el.src = src;
    el.onload = ()=>{
        onOver(el)
        Images[src] = el;
    }
};


const typeTexts = `入坑作
最喜歡
看最多次
最想安利

最佳劇情
最佳畫面
最佳配樂
最佳配音

最治癒
最感動
最虐心
最被低估

最過譽
最離譜
最討厭`;

const types = typeTexts.trim().split(/\n+/g);


const bangumiLocalKey = 'margiconch-animes-grid';


let bangumis = [];


const generatorDefaultBangumis = ()=> {
    bangumis = new Array(types.length).fill(null);
}

const getBangumiIdsText = ()=> bangumis.map(i=>String( i || 0 )).join(',')

const getBangumisFormLocalStorage = ()=>{
    if(!window.localStorage) return generatorDefaultBangumis();

    const bangumisText = localStorage.getItem(bangumiLocalKey);
    if(!bangumisText) return generatorDefaultBangumis();

    bangumis = bangumisText.split(/,/g).map(i=>/^\d+$/.test(i) ? +i : i);
}

getBangumisFormLocalStorage();
const saveBangumisToLocalStorage = ()=>{
    localStorage.setItem(bangumiLocalKey,getBangumiIdsText());
};


const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const bodyMargin = 20;
const contentWidth = 600;
const contentHeight = 560;


const col = 5;
const row = 3;

const colWidth = Math.ceil(contentWidth / col);
const rowHeight = Math.ceil(contentHeight / row);
const titleHeight = 40;
const fontHeight = 24;

const width = contentWidth + bodyMargin * 2;
const height = contentHeight + bodyMargin * 2 + titleHeight;
const scale = 3;


canvas.width = width * scale;
canvas.height = height * scale;

ctx.fillStyle = '#FFF';
ctx.fillRect(
    0,0, 
    width * scale,height * scale
);

ctx.textAlign = 'left';
ctx.font = `${9 * scale}px sans-serif`;
ctx.fillStyle = '#AAA';
ctx.textBaseline = 'middle';
ctx.lineCap  = 'round';
ctx.lineJoin = 'round';
ctx.fillText(
    '@卜卜口 · lab.magiconch.com/anime-grid · 神奇海螺試驗場 · 動畫信息來自番組計畫 · 禁止商業、營利用途',
    19 * scale,
    (height - 10) * scale
);

ctx.scale(scale,scale);
ctx.translate(
    bodyMargin,
    bodyMargin + titleHeight
);

ctx.font = '16px sans-serif';
ctx.fillStyle = '#222';
ctx.textAlign = 'center';


ctx.save();


ctx.font = 'bold 24px sans-serif';
ctx.fillText('動畫生涯個人喜好表',contentWidth / 2, -24 );




ctx.lineWidth = 2;
ctx.strokeStyle = '#222';

for(let y = 0;y <= row;y++){

    ctx.beginPath();
    ctx.moveTo(0,y * rowHeight);
    ctx.lineTo(contentWidth,y * rowHeight);
    ctx.globalAlpha = 1;
    ctx.stroke();

    if( y === row) break;
    ctx.beginPath();
    ctx.moveTo(0,y * rowHeight + rowHeight - fontHeight);
    ctx.lineTo(contentWidth,y * rowHeight + rowHeight - fontHeight);
    ctx.globalAlpha = .2;
    ctx.stroke();
}
ctx.globalAlpha = 1;
for(let x = 0;x <= col;x++){
    ctx.beginPath();
    ctx.moveTo(x * colWidth,0);
    ctx.lineTo(x * colWidth,contentHeight);
    ctx.stroke();
}
ctx.restore();


for(let y = 0;y < row;y++){

    for(let x = 0;x < col;x++){
        const top = y * rowHeight;
        const left = x * colWidth;
        const type = types[y * col + x];
        ctx.fillText(
            type,
            left + colWidth / 2,
            top + rowHeight - fontHeight / 2,
        );
    }
}

const APIURL = `https://lab.magiconch.com/api/bangumi/`;
// const APIURL = `http://localhost:60912/api/bangumi/`;
const ImageURL = `https://api.anitabi.cn/bgm/`;


const getCoverURLById = id => `${ImageURL}anime/${id}/cover.jpg`;

let currentBangumiIndex = null;
const searchBoxEl = document.querySelector('.search-bangumis-box');
const formEl = document.querySelector('form');
const searchInputEl = formEl[0];
const animeListEl = document.querySelector('.anime-list');

const openSearchBox = (index)=>{
    currentBangumiIndex = index;
    htmlEl.setAttribute('data-no-scroll',true);
    searchBoxEl.setAttribute('data-show',true);
    
    searchInputEl.focus();

    const value = bangumis[currentBangumiIndex];

    if(!/^\d+$/.test(value)){
        searchInputEl.value = value;
    }
        
}
const closeSearchBox = ()=>{
    htmlEl.setAttribute('data-no-scroll',false);
    searchBoxEl.setAttribute('data-show',false);
    searchInputEl.value = '';
    formEl.onsubmit();
};
const setInputText = ()=>{
    const text = searchInputEl.value.trim().replace(/,/g,'');
    setCurrentBangumi(text);
}


const setCurrentBangumi =  (value)=>{

    bangumis[currentBangumiIndex] = value;
    saveBangumisToLocalStorage();
    drawBangumis();

    closeSearchBox();
}

animeListEl.onclick = e=>{
    const id = +e.target.getAttribute('data-id');
    if(currentBangumiIndex === null) return;
    setCurrentBangumi(id);
};

const searchFromBangumiByKeyword = async keyword=>{
    let url = `${APIURL}anime/onlines`;
    if(keyword) url = url + `?keyword=${encodeURIComponent(keyword)}`;

    const animes = await get(url);
    resetAnimeList(animes);
}
const searchFromBangumi = ()=>{
    const keyword = searchInputEl.value.trim();
    if(!keyword) return searchInputEl.focus();

    searchFromBangumiByKeyword(keyword);
}


const searchFromAPI = async keyword=>{
    let url = `${APIURL}animes`;
    if(keyword) url = url + `?keyword=${encodeURIComponent(keyword)}`;

    const animes = await get(url);
    resetAnimeList(animes);
}

const resetAnimeList = animes=>{
    animeListEl.innerHTML = animes.map(anime=>{
        return `<div class="anime-item" data-id="${anime.id}"><img src="${getCoverURLById(anime.id)}" crossOrigin="Anonymous"><h3>${anime.title}</h3></div>`;
    }).join('');
}
formEl.onsubmit = async e=>{
    if(e) e.preventDefault();

    const keyword = searchInputEl.value.trim();

    searchFromAPI(keyword);
}

formEl.onsubmit();




const imageWidth = colWidth - 2;
const imageHeight = rowHeight - fontHeight;
const canvasRatio = imageWidth / imageHeight;

ctx.font = 'bold 32px sans-serif';

const drawBangumis = ()=>{
    for(let index in bangumis){
        const id = bangumis[index];
        if(!id) continue;
        const x = index % col;
        const y = Math.floor(index / col);

        if(!/^\d+$/.test(id)){ // 非数字

            ctx.save();
            ctx.fillStyle = '#FFF';
            ctx.fillRect(
                x * colWidth + 1,
                y * rowHeight + 1, 
                imageWidth,
                imageHeight,
            )
            ctx.restore();
            ctx.fillText(
                id,
                (x + 0.5) * colWidth,
                (y + 0.5) * rowHeight - 4, 
                imageWidth - 10,
            );
            continue;
        }
        
        loadImage(getCoverURLById(id),el=>{
            const { naturalWidth, naturalHeight } = el;
            const originRatio = el.naturalWidth / el.naturalHeight;

            let sw, sh, sx, sy;
            if(originRatio < canvasRatio){
                sw = naturalWidth
                sh = naturalWidth / imageWidth * imageHeight;
                sx = 0
                sy = (naturalHeight - sh)
            }else{
                sh = naturalHeight
                sw = naturalHeight / imageHeight * imageWidth;
                sx = (naturalWidth - sw)
                sy = 0
            }

            ctx.drawImage(
                el,
                
                sx, sy,
                sw, sh, 

                x * colWidth + 1,
                y * rowHeight + 1, 
                imageWidth,
                imageHeight,
            );
        })
    }
}


const outputEl = document.querySelector('.output-box');
const outputImageEl = outputEl.querySelector('img');
const showOutput = imgURL=>{
    outputImageEl.src = imgURL;
    outputEl.setAttribute('data-show',true);
    htmlEl.setAttribute('data-no-scroll',true);
}
const closeOutput = ()=>{
    outputEl.setAttribute('data-show',false);
    htmlEl.setAttribute('data-no-scroll',false);
}

const downloadImage = ()=>{
    const fileName = '[神奇海螺][動畫生涯個人喜好表].jpg';
    const mime = 'image/jpeg';
    const imgURL = canvas.toDataURL(mime,0.8);
    const linkEl = document.createElement('a');
    linkEl.download = fileName;
    linkEl.href = imgURL;
    linkEl.dataset.downloadurl = [ mime, fileName, imgURL ].join(':');
    document.body.appendChild(linkEl);
    linkEl.click();
    document.body.removeChild(linkEl);
    new Image().src = `${APIURL}grid?ids=${getBangumiIdsText()}`;

    showOutput(imgURL);
}

canvas.onclick = e=>{
    const rect = canvas.getBoundingClientRect();
    const { clientX, clientY } = e;
    const x = Math.floor(((clientX - rect.left) / rect.width * width - bodyMargin) / colWidth);
    const y = Math.floor(((clientY - rect.top) / rect.height * height  - bodyMargin - titleHeight) / rowHeight);

    if(x < 0) return;
    if(x > col) return;
    if(y < 0) return;
    if(y > row) return;

    const index = y * col + x;

    if(index >= col * row) return;

    openSearchBox(index);
}


drawBangumis();