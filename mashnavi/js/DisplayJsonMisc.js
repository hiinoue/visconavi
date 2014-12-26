<!--

// グローバル

var hlist_item;
var itemIndexSelected = -1;
var hlist_color;
var colorIndexSelected = -1;
var hlist_size;
var hlist_matashita;
var sizeIndexSelected = -1;
var hlist_opt = null;
var optIndexSelected = -1;
var hlist_parts = null;
var partsIndexSelected = -1;

function clearDisplayList(ilist)
{
	while (ilist.firstChild) {
		ilist.removeChild(ilist.firstChild);
	}
}

function displaySpecList(ispeclist, specarray)
{
	if (ispeclist == null)
		return;
	clearDisplayList(ispeclist);
	if (specarray == null)
		return;
	var specObj;
	// alert('displaySpecList specarray.length=' + specarray.length);
	for (var i = 0; i < specarray.length; i++)
	{
		var specObj = specarray[i];
		var trelem = document.createElement('tr');
		ispeclist.appendChild(trelem);
		var tdelem = document.createElement('td');
		trelem.appendChild(tdelem);
		var figelem = document.createElement('figure');
		figelem.name = i;
		figelem.style.margin = '0';
		/** appendChildの順序を変える事によりfigcaptionとimgの表示順も変わる
		if (specObj.img != null)
		{
			var imgelem = new Image();
			imgelem.src = specObj.img;
			figelem.appendChild(imgelem);
		}
		**/
		tdelem.appendChild(figelem);
		var capelem = document.createElement('figcaption');
		var desc_array = specObj.description;
		for (var j = 0; j < desc_array.length; j++)
		{
			if (j != 0)
				capelem.appendChild(document.createElement('br'));
			capelem.appendChild(document.createTextNode(desc_array[j]));
		}
		figelem.appendChild(capelem);
		//
		// appendChildの順序を変える事によりfigcaptionとimgの表示順も変わる
		//	この場合はcaptionが上になる
		if (specObj.img != null)
		{
			var imgelem = document.createElement('img');
			imgelem.src = specObj.img;
			figelem.appendChild(imgelem);
		}
		figelem.setAttribute('onClick', 'chSpecImg(this)');
		// alert('displaySpecList ' + i);
	}
}

function displayItemList(iitemlist, itemarray)
{
	if (iitemlist == null)
		return;
	clearDisplayList(iitemlist);
	if (itemarray == null)
		return;	curItemIndex = -1;
	// alert('length2=' + children.length);
	for (var i = 0; i < itemarray.length; i++)
	{
		var item = itemarray[i];
		var trelem = document.createElement('tr');
		iitemlist.appendChild(trelem);
		var tdelem = document.createElement('td');
		trelem.appendChild(tdelem);
		var imgelem = document.createElement('img');
		imgelem.src = item['-url'];
		imgelem.alt = i;
		imgelem.setAttribute('onClick', 'chItemImg(this)');
		imgelem.style.width = '100px';
		// imgelem.style.height = '100px';
		tdelem.appendChild(imgelem);
	}
}

function displayColorList(icolorlist, colorarray)
{
	var rowPerType = true;
	var tType = null, type;
	var trelem;
	clearDisplayList(icolorlist);
	colorIndexSelected = -1;
	for (i = 0; i < colorarray.length; i++)
	{
		var color =  colorarray[i][0];
		if (rowPerType)
		{
			type = colorarray[i][1];
			if (type != tType)
			{
				trelem = document.createElement('tr');
				icolorlist.appendChild(trelem);
				tType = type;
				var thelem = document.createElement('th');
				thelem.appendChild(document.createTextNode(type['-name']));
				trelem.appendChild(thelem);
			}
		}
		else
		{
			trelem = document.createElement('tr');
			icolorlist.appendChild(trelem);
		}
		var tdelem = document.createElement('td');
		trelem.appendChild(tdelem);
		var figelem = document.createElement('figure');
		figelem.style.margin = '0';
		tdelem.appendChild(figelem);
		var imgelem = document.createElement('img');
		imgelem.src = color['-url'];
		imgelem.alt = i;
		imgelem.setAttribute('onClick', 'chColImg(this)');
		figelem.appendChild(imgelem);
		var capelem = document.createElement('figcaption');
		capelem.appendChild(document.createTextNode(color['-name']));
		figelem.appendChild(capelem);
	}
}

function displayOptList(ioptlist, optarray)
{
	if (ioptlist == null)
		return;
	clearDisplayList(ioptlist);
	optIndexSelected = -1;
	if (optarray == null)
		return;
	var optObj;
	// alert('displayOptList optarray.length=' + optarray.length);
	for (var i = 0; i < optarray.length; i++)
	{
		var optObj = optarray[i];
		var trelem = document.createElement('tr');
		ioptlist.appendChild(trelem);
		var tdelem = document.createElement('td');
		trelem.appendChild(tdelem);
		var figelem = document.createElement('figure');
		figelem.name = i;
		figelem.style.margin = '0';
		tdelem.appendChild(figelem);
		var capelem = document.createElement('figcaption');
		capelem.appendChild(document.createTextNode(optObj['-name']));
		figelem.appendChild(capelem);
		figelem.setAttribute('onClick', 'chOptImg(this)');
		// alert('displayOptList ' + i);
		/**var imgelem = document.createElement('img');
		imgelem.src = color['-url'];
		imgelem.alt = count;
		imgelem.setAttribute('onClick', 'chColImg(this)');
		figelem.appendChild(imgelem); **/
	}
}

function setSelected(tlist, curIndex, newIndex)
{
	if (tlist == null)
		return -1;
	if (newIndex != curIndex)
	{
		var trdelem, tdlist;
		for (i = 0, j = 0; i < tlist.children.length; i++)
		{
			trdelem = tlist.children[i];
			if (trdelem.tagName.toLowerCase() == 'td')
			{
				if (j == curIndex)
					trdelem.style.backgroundColor = 'transparent';
				else if (j == newIndex)
					trdelem.style.backgroundColor = '#99FF00';
				j++;
			}
			else
			{
				tdlist = trdelem.getElementsByTagName('td');
				for (k = 0; k < tdlist.length; k++, j++)
				{
					trdelem = tdlist[k];
					if (j == curIndex)
						trdelem.style.backgroundColor = 'transparent';
					else if (j == newIndex)
						trdelem.style.backgroundColor = '#99FF00';
				}
			}
		/**
		if (curIndex >= 0)
			tlist.children[curIndex].style.backgroundColor = 'transparent';
		if (newIndex >= 0)
			tlist.children[newIndex].style.backgroundColor = '#99FF00';
		**/
		}
	}
	return newIndex;
}

function displayPartsList(ipartslist, partsarray)
{
	if (ipartslist == null)
		return;
	clearDisplayList(ipartslist);
	partsIndexSelected = -1;
	if (partsarray == null)
		return;
	var optObj = basket.jscache.getOptObject(-1);
	var buttonFolder = 'catalog/PNP00Z/'; //// parentTypeOf(basket.getColor())['-buttonFolder'];
	var selparts = basket.getSelectedParts(optObj['-code']);
	var selindex = -1;
	var partsObj;
	for (var i = 0; i < partsarray.length; i++)
	{
		var partsObj = partsarray[i];
		var trelem = document.createElement('tr');
		ipartslist.appendChild(trelem);
		var tdelem = document.createElement('td');
		trelem.appendChild(tdelem);
		var figelem = document.createElement('figure');
		figelem.style.margin = '0';
		tdelem.appendChild(figelem);
		var capelem = document.createElement('figcaption');
		capelem.appendChild(document.createTextNode(partsObj['-name']));
		figelem.appendChild(capelem);
		var imgelem = document.createElement('img');
		imgelem.src = buttonFolder + partsObj['-button'];
		imgelem.alt = i;
		imgelem.setAttribute('onClick', 'chPartsImg(this)');
		figelem.appendChild(imgelem);
		if (partsObj['-code'] == selparts)
			selindex = i;
	}
	partsIndexSelected = setSelected(ipartslist, partsIndexSelected, selindex);
}

function displaySizeList(isizelist, sizearray)
{
	if (isizelist == null)
		return;
	clearDisplayList(isizelist);
	sizeIndexSelected = -1;
	if (sizearray == null)
		return;
	// var optObj = optarray[optIndex];
	//var buttonFolder = basket.getColor().parentNode['-buttonFolder'];
	var selsize = basket.getSize();
	var selindex = -1;
	var sizeObj;
	for (var i = 0; i < sizearray.length; i++)
	{
		var sizeObj = sizearray[i];
		/**
		var trelem = document.createElement('tr');
		isizelist.appendChild(trelem);
		**/
		var tdelem = document.createElement('td');
		isizelist.appendChild(tdelem);
		var figelem = document.createElement('figure');
		figelem.name = i;
		figelem.style.margin = '0';
		tdelem.appendChild(figelem);
		var capelem = document.createElement('figcaption');
		capelem.appendChild(document.createTextNode(sizeObj['-name']));
		figelem.appendChild(capelem);
		figelem.setAttribute('onClick', 'chSize(this)');
		/*** var imgelem = document.createElement('img');
		imgelem.alt = i;
		imgelem.style.visibility = 'hidden';
		figelem.appendChild(imgelem); ***/
		if (selsize != null && sizeObj['-code'] == selsize['-code'])
			selindex = i;
	}
	//alert('sizelist len=' + isizelist.children.length);
	sizeIndexSelected = setSelected(isizelist, sizeIndexSelected, selindex);
}

function displayMatashitaList(imatashitalist)
{
	if (imatashitalist == null)
		return;
	// clearDisplayList(imatashitalist);
	if (matashitaArray == null)
	{
		imatashitalist.style.visibility = 'hidden';
		return;
	}
	var selMatashita = basket.getMatashita();
	if (selMatashita < 0)
		selMatashita = matashitaDefault;
	var selindex = -1;
	for (var i = 0; i < matashitaArray.length; i++)
	{
		var optelem = document.createElement('option');
		imatashitalist.appendChild(optelem);
		optelem.value = matashitaArray[i];
		optelem.appendChild(document.createTextNode(matashitaArray[i]));
		optelem.setAttribute('onClick', 'chMatashita(this)');
		if (selMatashita > 0 && matashitaArray[i] == selMatashita)
			selindex = i;
	}
	// alert('matashitaArray len=' + imatashitalist.children.length + ' selindex of ' + selMatashita + ' = ' + selindex);
	if (imatashitalist.children.length > 0)
	{
		imatashitalist.style.visibility = 'visible';
		if (selindex >= 0)
			imatashitalist.selectedIndex = selindex;
	}
}

function displayMatashitaSlider(imatashitalist)
{
	var jscache = basket.jscache;

	if (imatashitalist == null)
		return;
	if (jscache.matashitaArray == null)
	{
		imatashitalist.style.visibility = 'hidden';
		return;
	}
	imatashitalist.style.visibility = 'visible';
	var selMatashita = basket.getMatashita();
	if (selMatashita < 0)
		selMatashita = jscache.matashitaDefault;
	var selindex = -1;
	var cacheArray = jscache.matashitaArray;
	var min_matashita = cacheArray[0];
	var max_matashita = cacheArray[cacheArray.length - 1];
	var step_matashita = 0.5;
	if (cacheArray.Length > 1)
		step_matashita = cacheArray[1] - cacheArray[0];

	// alert('matashita min:' + min_matashita + ' max:' + max_matashita + ' step:' + step_matashita + ' value:' + selMatashita);
	// jqeuryを使わない場合
	var p = document.getElementById('matashita_min');
	p.childNodes[0].nodeValue = min_matashita + 'cm';
	// jqueryを使う場合は次のように書く
	$('#matashita_max')[0].childNodes[0].nodeValue = max_matashita + 'cm';
	$('#matashita').slider({
			max: max_matashita, //最大値
			min: min_matashita, //最小値
			value: selMatashita, //初期値
			step: step_matashita, //幅
  			orientation: 'horizontal', //縦設置か横設置か
 
			slide: function( event, ui ) {
				basket.setMatashita(ui.value);
				$('#slidervalue').html('slider：' + ui.value);
			},
			create: function( event, ui ) {
				$('#slidervalue').html('create：' + $(this).slider('value'));
				basket.setMatashita($(this).slider('value'));
			},
			start: function( event, ui ){
				basket.setMatashita(ui.value);
				$('#slidervalue').html('start：' + ui.value);
			},
			stop: function( event, ui ) {
				basket.setMatashita(ui.value);
				$('#slidervalue').html('stop：' + ui.value);
			},
			change: function( event, ui ) {
				basket.setMatashita(ui.value);
				$('#slidervalue').html('change：' + ui.value);
			}
	});
/****
 //ボタンを押したら値を100にする
 $("#valueset").click(function(){
  $("#slider").slider("value",100);
 });
});

	for (var i = 0; i < matashitaArray.length; i++)
	{
		if (selMatashita > 0 && matashitaArray[i] == selMatashita)
			selindex = i;
	}
	// alert('matashitaArray len=' + imatashitalist.children.length + ' selindex of ' + selMatashita + ' = ' + selindex);
	if (imatashitalist.children.length > 0)
	{
		imatashitalist.style.visibility = 'visible';
		if (selindex >= 0)
			imatashitalist.selectedIndex = selindex;
	}
***/
}
-->
