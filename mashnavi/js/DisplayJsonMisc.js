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


function displayItemList(iitemlist, itemarray)
{
	curItemIndex = -1;
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
	while (icolorlist.children.length > 0) icolorlist.removeChild(icolorlist.children[0]);
	colorIndexSelected = -1;
	for (i = 0; i < colorarray.length; i++)
	{
		var color =  colorarray[i];
		
		if (rowPerType)
		{
			type = parentTypeOf(color);
			if (type != tType)
			{
				trelem = document.createElement('tr');
				icolorlist.appendChild(trelem);
				tType = type;
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
		var capelem = document.createElement('figcaption');
		capelem.appendChild(document.createTextNode(color['-name']));
		figelem.appendChild(capelem);
		var imgelem = document.createElement('img');
		imgelem.src = color['-url'];
		imgelem.alt = i;
		imgelem.setAttribute('onClick', 'chColImg(this)');
		figelem.appendChild(imgelem);
	}
}

function displayOptList(ioptlist, optarray)
{
	if (ioptlist == null)
		return;
	while (ioptlist.children.length > 0) ioptlist.removeChild(ioptlist.children[0]);
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
		if (curIndex >= 0)
			tlist.children[curIndex].style.backgroundColor = 'transparent';
		if (newIndex >= 0)
			tlist.children[newIndex].style.backgroundColor = '#99FF00';
	}
	return newIndex;
}

function displayPartsList(ipartslist, partsarray)
{
	if (ipartslist == null)
		return;
	while (ipartslist.children.length > 0) ipartslist.removeChild(ipartslist.children[0]);
	partsIndexSelected = -1;
	if (partsarray == null)
		return;
	var optObj = null;
	if (optArrayCache != null &&
	    curOptIndex >=0)
		optObj = optArrayCache[curOptIndex];
	var buttonFolder = parentTypeOf(basket.getColor())['-buttonFolder'];
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
	while (isizelist.children.length > 0) isizelist.removeChild(isizelist.children[0]);
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
	while (imatashitalist.children.length > 0) imatashitalist.removeChild(imatashitalist.children[0]);
	if (matashitaList == null)
	{
		imatashitalist.style.visibility = 'hidden';
		return;
	}
	var selMatashita = basket.getMatashita();
	if (selMatashita < 0)
		selMatashita = matashitaDefault;
	var selindex = -1;
	for (var i = 0; i < matashitaList.length; i++)
	{
		var optelem = document.createElement('option');
		imatashitalist.appendChild(optelem);
		optelem.value = matashitaList[i];
		optelem.appendChild(document.createTextNode(matashitaList[i]));
		optelem.setAttribute('onClick', 'chMatashita(this)');
		if (selMatashita > 0 && matashitaList[i] == selMatashita)
			selindex = i;
	}
	// alert('matashitalist len=' + imatashitalist.children.length + ' selindex of ' + selMatashita + ' = ' + selindex);
	if (imatashitalist.children.length > 0)
	{
		imatashitalist.style.visibility = 'visible';
		if (selindex >= 0)
			imatashitalist.selectedIndex = selindex;
	}
}
-->
