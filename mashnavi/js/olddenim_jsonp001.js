
// グローバル

var globalFullDesignTemplate = null; // String
var globalPartsTemplate = null; // String

var basket = null;
var json_root = null;

function handle_json(jsondata)
{
	// alert('handle_json');
	json_root = jsondata;
	if (json_root == undefined)
	{
		alert('jsondata == undefined');
		return;
	}
	if (json_root == null)
	{
		alert('jsondata == null');
		return;
	}
	basket = new Basket();
	basket.jsonroot = jsondata;
	var canvas = document.getElementById('front');
	var context = canvas.getContext('2d');
	basket.set_canvas_front(canvas, context);						
	//オンライン描画コンテキストの取得
	canvas = document.getElementById('back');
	context = canvas.getContext('2d');
	basket.set_canvas_back(canvas, context);						
	//alert('canvas_back=' + basket.get_canvas_back());
	//オフライン描画コンテキストの取得
	canvas = document.getElementById('offline');
	context = canvas.getContext('2d');
	basket.set_offimage(canvas, context);						
	hlist_item = document.getElementById('itemlist');
	hlist_color = document.getElementById('colorlist');
	hlist_size = document.getElementById('sizelist');
	hlist_matashita = document.getElementById('matashita');
	hlist_opt = document.getElementById('optlist');
	hlist_parts = document.getElementById('partslist');
	itemArrayCache = makeItemArray(json_root);
	displayItemList(hlist_item, itemArrayCache);
}

function jsonp_connect()
{
	var local = true;
	var via_script = true;
	// alert('jsonp_connect local=' + local + ' via_script=' + via_script);
	//オンライン描画コンテキストの取得
	// cacheprogress.addEvent( window, 'load', cacheprogress.initialize );

	var jsonfile = 'catalog/MashNaviItem_mobile.js';
	if (!local)
		jsonfile = 'http://100.126.1.62/mashnavi/' + jsonfile;

	if (via_script)
	{
		var script = document.createElement('script');
		script.src = jsonfile;
		window.callback = function(data){
  			handle_json(data);
		}
		document.body.appendChild(script);
	}
	else
	{
		$.ajax({
			url: jsonfile, 
			type: 'Get',
			dataType: 'jsonp', 
			error: function () {alert('ロード失敗');}, 
			success: function(json_return)
			{
				handle_json(json_return);
			}
		});
	}
}

function setItemNo(itemno)
{
	var newItem = (itemno >= 0 ? itemArrayCache[itemno] : null);
	if (newItem == basket.getItem())
		return;
	var makeCXArray = false;
	var makeCArray = false;
	var makePXArray = false;
	var makePArray = false;
	// alert('chItemImg alt=' + opt.alt);
	var designtemp = newItem['-designTemplate'];
	var sub = newItem['-sub'];
	var siltemp = newItem['-silhouetteTemplate'];
	var partstemp = newItem['-partsTemplate'];

	if (designtemp == null ||
	    designtemp != basket.getDesignTemplate())
		makeCXArray = makeCArray = true;
	else if (designtemp + sub != globalFullDesignTemplate)
		makeCXArray = true;
	if (partstemp != globalPartsTemplate)
		makePXArray = makePArray = true;
	basket.setItem(newItem);
	itemIndexSelected = setSelected(hlist_item, itemIndexSelected, itemno);
	if (makeCXArray)
		colorArrayCache = makeColorArrayFromTemplate(json_root, designtemp ? designtemp + sub : null, designtemp ? null : newItem.Fablic.TypeList);
	if (makeCArray)
	{ 
		displayColorList(hlist_color, colorArrayCache);
		var newColorIndex = 0;	// default動作
		basket.setColor(colorArrayCache[newColorIndex]);
		colorIndexSelected = setSelected(hlist_color, colorIndexSelected, newColorIndex);
	}
	if (makePXArray)
	{
		optArrayCache = makeOptArrayFromTemplate(json_root, partstemp);
		basket.makePartsArray(optArrayCache, partstemp);
	}
	if (makePArray)
	{ 
		displayOptList(hlist_opt, optArrayCache);
		var newOptIndex = (optArrayCache == null || optArrayCache.length == 0 ? -1 : 0);
		displayOptParts(newOptIndex);
	}
	sizeArrayCache = makeSizeArray(newItem);
	displaySizeList(hlist_size, sizeArrayCache);
	displayMatashitaList(hlist_matashita);
}

function displayOptParts(newOptIndex)
{
	partsArrayCache = makePartsArray(optArrayCache, newOptIndex);
	displayPartsList(hlist_parts, partsArrayCache);
	optIndexSelected = setSelected(hlist_opt, optIndexSelected, newOptIndex);
}

function chItemImg(opt)
{
	// alert('chItemImg alt=' + opt.alt);
	setItemNo(opt.alt);
}

function selectColorImage(colorIndex)
{
	basket.setColor(colorIndex >= 0 ? colorArrayCache[colorIndex] : null);
	colorIndexSelected = setSelected(hlist_color, colorIndexSelected, colorIndex);
}
function chColImg(opt)
{
	selectColorImage(opt.alt);
}
function handleOpts(event)
{
	if (optArrayCache == null ||
	    optArrayCache.length == 0)
		return;
 	document.getElementById('opttab').style.visibility = 'visible';
	document.getElementById('partstab').style.visibility = 'visible';
	displayOptList(hlist_opt, optArrayCache);
	newIndex = 0;
	displayOptParts(newIndex);
}

function prevPage(event)
{
	var selSize = document.getElementById('selectSize');
	var zidx = Number(selSize.style.zIndex);
	if (zidx > 0)
	{
		var prev = document.getElementById('prev');
 		selSize.style.zIndex = '-1';
		prev.style.display = 'none';
		
		var szdata = document.getElementById('SizeData');
		szdata.style.display = 'none';
		var simu = document.getElementById('simulation');
		simu.style.display = 'inline';
	}
}

function nextPage(event)
{
	var selSize = document.getElementById('selectSize');
	/**
	var selParts = document.getElementById('selectParts');
	if (selParts)
	{	
		//alert('selParts=' + selSize.style.width + 'x' + selSize.style.height);
		selSize.style.width = selParts.style.width;
		selSize.style.height = selParts.style.height;
	}
	***/
	var zidx = Number(selSize.style.zIndex);
	if (zidx <= 0)
	{
		var prev = document.getElementById('prev');
 		selSize.style.zIndex = '3';
		itemObj = basket.getItem();
		sizeArrayCache = makeSizeArray(itemObj);
		displaySizeList(hlist_size, sizeArrayCache);
		displayMatashitaList(hlist_matashita);
		prev.style.display = 'inline';

		var szdata = document.getElementById('SizeData');
		szdata.style.display = 'inline';
		var simu = document.getElementById('simulation');
		simu.style.display = 'none';
	}
}

function selectSize(sizeIndex)
{
	//alert('size ' + sizeIndexSelected + ' -> ' + sizeIndex);
	basket.setSize(sizeIndex >= 0 ? sizeArrayCache[sizeIndex] : null);
	sizeIndexSelected = setSelected(hlist_size, sizeIndexSelected, sizeIndex);
	//alert('sizeInexSelected=' + sizeIndexSelected);
}

function chSize(node)
{
	selectSize(node.name);
}

function chMatashita(node)
{
	//var selidx = hlist_matashita.selectedIndex;
	basket.setMatashita(hlist_matashita.value);
}

function chOptImg(node)
{
	if (node.name == curOptIndex)
		return;
	var newIndex = node.name;
	displayOptParts(newIndex);
}

function SelectPartsImage(opt, code)
{
	partsIndexSelected = setSelected(hlist_parts, partsIndexSelected, basket.SelectParts(opt, code));
}
function chPartsImg(opt)
{
	SelectPartsImage(optArrayCache[curOptIndex]['-code'], partsArrayCache[opt.alt]['-code']);
}



function bodyGesture(event)
{
	event.preventDefault();
}

//var	cvswidth;
var	cvsheight;
function canvasGestureStart(event)
{
	var node = event.target;

	/*
	if (node.style.width == null ||
	    node.style.width == '')
		cvswidth = node.width;
	else
	{
		cvswidth = node.style.width;
		//alert('style.width=' + node.style.width);
		cvswidth = cvswidth.substring(0, cvswidth.length - 2);
	}
	*/
	if (node.style.height == null ||
	    node.style.height == '')
	{
		cvsheight = document.defaultView.getComputedStyle(basket.get_canvas_front(), null).getPropertyValue('height'); // CSSから
		if (cvsheight == null)
		{
			//alert('canvas_front css height=' + cvsheight);
			cvsheight = node.height;
		}
	}
	else
	{
		cvsheight = node.style.height;
		//alert('style.height=' + node.style.height);
	}
	if (cvsheight.substring(cvsheight.length - 2, cvsheight.length) == 'px')
		cvsheight = cvsheight.substring(0, cvsheight.length - 2);

	// alert('height=' + cvsheight);
}
function canvasGesture(event)
{
	// alert('canvasGesture ' + event.scale);
	var node = event.target;
	//	node.style.width = (cvswidth * event.scale) + 'px';
	node.style.height = (cvsheight * event.scale) + 'px';
}
function suppressGesture(event)
{
	event.preventDefault();
}
