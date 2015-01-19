<!--

var DisplayBox = function(domobj, maxcolumn) {
// グローバル

	this.domobj = domobj;
	this.maxcolumn = maxcolumn;
	this.clear();
}

DisplayBox.prototype.clear = function() {
	while (this.domobj.firstChild) {
		this.domobj.removeChild(this.domobj.firstChild);
	}
	this.elemarray = [];
	this.selectedIndex = -1;
}

DisplayBox.prototype.setSelected = function(newIndex) {
	if (this.domobj == null)
		return -1;
	var arraylen = this.elemarray.length;
	var curSel = this.selectedIndex;
	if (curSel >= arraylen)
		curSel = -1;
	if (newIndex >= arraylen)
		return curSel;
	if (newIndex != curSel)
	{
		if (curSel >= 0)
			this.elemarray[curSel].style.backgroundColor = 'transparent';
		if (newIndex >= 0)
			this.elemarray[newIndex].style.backgroundColor = '#99FF00';
	}
	this.selectedIndex = newIndex;
	return newIndex;
}


function displaySpecList(specbox, specarray)
{
	if (specbox == null)
		return;
	specbox.clear();
	if (specarray == null)
		return;
	var specObj;
	// alert('displaySpecList specarray.length=' + specarray.length);
	for (var i = 0; i < specarray.length; i++)
	{
		var specObj = specarray[i];
		var trelem = document.createElement('tr');
		specbox.domobj.appendChild(trelem);
		var tdelem = document.createElement('td');
		trelem.appendChild(tdelem);
		specbox.elemarray.push(tdelem);
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
			// imgelem.crossOrigin = 'anonymous';
			figelem.appendChild(imgelem);
		}
		figelem.setAttribute('onClick', 'chSpecImg(this)');
		// alert('displaySpecList ' + i);
	}
}

function displayItemList(itembox, itemarray)
{
	var dispItemName = true;
	if (itembox == null)
		return;
	itembox.clear();
	if (itemarray == null)
		return;
	// alert('ItemList length=' + itemarray.length);
	for (var i = 0; i < itemarray.length; i++)
	{
		var item = itemarray[i];
		var trelem = document.createElement('tr');
		itembox.domobj.appendChild(trelem);
		var tdelem = document.createElement('td');
		trelem.appendChild(tdelem);
		itembox.elemarray.push(tdelem);
		var imgelem = document.createElement('img');
		imgelem.src = item['-url'];
		imgelem.alt = i;
		imgelem.setAttribute('onClick', 'chItemImg(this)');
		tdelem.appendChild(imgelem);
		if (dispItemName) {
			textelem = document.createElement('span');
			textelem.setAttribute('class', 'itemlabel');
			tdelem.appendChild(textelem);
			textelem.appendChild(document.createTextNode(item['-name']));
		}
	}
}

function displayColorList(colorbox, colorarray)
{
	var rowPerType = true;
	var useTooltip = true;
	var tType = null, type;
	var collimit = colorbox.maxcolumn;
	var waycount = 0;
	var trelem;
	colorbox.clear();
	for (i = 0; i < colorarray.length; i++)
	{
		var color =  colorarray[i][0];
		if (rowPerType)
		{
			type = colorarray[i][1];
			if (type != tType) {
				trelem = document.createElement('tr');
				colorbox.domobj.appendChild(trelem);
				tType = type;
				var thelem = document.createElement('th');
				thelem.appendChild(document.createTextNode(type['-name']));
				trelem.appendChild(thelem);
				waycount = 0;
			} else if (waycount >= collimit) {
				trelem = document.createElement('tr');
				colorbox.domobj.appendChild(trelem);
				var thelem = document.createElement('th');
				thelem.appendChild(document.createTextNode(''));
				trelem.appendChild(thelem);
				waycount = 0;
			}
		}
		else
		{
			trelem = document.createElement('tr');
			colorbox.domobj.appendChild(trelem);
		}
		var tdelem = document.createElement('td');
		trelem.appendChild(tdelem);
		waycount++;
		colorbox.elemarray.push(tdelem);
		if (useTooltip) {
			tdelem.setAttribute('class', 'tooltip');
			var imgelem = document.createElement('img');
			imgelem.src = color['-url'];
			imgelem.alt = i;
			imgelem.setAttribute('onClick', 'chColImg(this)');
			tdelem.appendChild(imgelem);
			var spanelem = document.createElement('span');
			spanelem.setAttribute('class', 'tooltipBody');
			tdelem.appendChild(spanelem);
			spanelem.style.margin = '0px';
			spanelem.appendChild(document.createTextNode(color['-name']));
			var spanelem2 = document.createElement('span');
			spanelem2.setAttribute('class', 'tooltipAngle');
			spanelem.appendChild(spanelem2);
			var spanelem3 = document.createElement('span');
			spanelem3.setAttribute('class', 'tooltipAngleInner');
			spanelem2.appendChild(spanelem3);
		} else {
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
}

function displayOptList(optbox, optarray)
{
	if (optbox == null)
		return;
	optbox.clear();
	if (optarray == null)
		return;
	var optObj;
	// alert('displayOptList optarray.length=' + optarray.length);
	for (var i = 0; i < optarray.length; i++)
	{
		var optObj = optarray[i];
		var trelem = document.createElement('tr');
		optbox.domobj.appendChild(trelem);
		var tdelem = document.createElement('td');
		trelem.appendChild(tdelem);
		optbox.elemarray.push(tdelem);
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

function displayPartsList(partsbox, partsarray)
{
	if (partsbox == null)
		return;
	partsbox.clear();
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
		partsbox.domobj.appendChild(trelem);
		var tdelem = document.createElement('td');
		trelem.appendChild(tdelem);
		partsbox.elemarray.push(tdelem);
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
	partsbox.setSelected(selindex);
}

function displaySizeList(sizebox, sizearray)
{
	if (sizebox == null)
		return;
	sizebox.clear();
	if (sizearray == null)
		return;
	// var optObj = optarray[optIndex];
	//var buttonFolder = basket.getColor().parentNode['-buttonFolder'];
	var selsize = basket.getSize();
	var collimit = sizebox.maxcolumn;
	var sizecount = 0;
	var selindex = -1;
	var sizeObj;
	for (var i = 0; i < sizearray.length; i++)
	{
		var sizeObj = sizearray[i];
		if (sizecount == 0 || sizecount >= collimit) {
			trelem = document.createElement('tr');
			sizebox.domobj.appendChild(trelem);
			sizecount = 0;
		}
		var tdelem = document.createElement('td');
		trelem.appendChild(tdelem);
		sizebox.elemarray.push(tdelem);
		sizecount++;
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
	sizebox.setSelected(selindex);
}

function displayMatashitaList(matashitabox)
{
	if (matashitabox == null)
		return;
	matashitabox.clear();
	if (matashitaArray == null)
	{
		matashitabox.domobj.style.visibility = 'hidden';
		return;
	}
	var selMatashita = basket.getMatashita();
	if (selMatashita < 0)
		selMatashita = matashitaDefault;
	var selindex = -1;
	for (var i = 0; i < matashitaArray.length; i++)
	{
		var optelem = document.createElement('option');
		matashitabox.domobj.appendChild(optelem);
		optelem.value = matashitaArray[i];
		optelem.appendChild(document.createTextNode(matashitaArray[i]));
		optelem.setAttribute('onClick', 'chMatashita(this)');
		if (selMatashita > 0 && matashitaArray[i] == selMatashita)
			selindex = i;
	}
	// alert('matashitaArray len=' + imatashitalist.children.length + ' selindex of ' + selMatashita + ' = ' + selindex);
	if (matashitabox.domobj.children.length > 0)
	{
		matashitabox.domobj.style.visibility = 'visible';
		matashitabox.setSelected(selindex);
	}
}
function displayMatashitaScale(imatashitaScale)
{
	while (imatashitaScale.firstChild) {
		imatashitaScale.removeChild(imatashitaScale.firstChild);
	}
	
	var jscache = basket.jscache;

	if (jscache.matashitaArray == null)
	{
		imatashitaScale.style.visibility = 'hidden';
		return;
	}
	imatashitaScale.style.visibility = 'visible';

	var cacheArray = jscache.matashitaArray;
	var min_matashita = cacheArray[0];
	var max_matashita = cacheArray[cacheArray.length - 1];
	var step = 2;
	for (i = min_matashita; i <= max_matashita; i += step)
	{
		var tdelem = document.createElement('td');
		imatashitaScale.appendChild(tdelem);
		tdelem.appendChild(document.createTextNode(i));
	}
}

function displayMatashitaSlider(matashitabox)
{
	var jscache = basket.jscache;

	if (matashitabox == null)
		return;
	if (jscache.matashitaArray == null)
	{
		matashitabox.domobj.style.visibility = 'hidden';
		return;
	}
	matashitabox.domobj.style.visibility = 'visible';
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
	$('#matashita')[0].style.width = ((max_matashita - min_matashita) * 10) + 'px';
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
			start: function( event, ui ) {
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
}
-->
