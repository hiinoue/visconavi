<!--
// Basket.js
var Basket = function(jsondata) {
	// 現在の選択内容
	this.curItem = null; // Item object
	this.curType = null; // Type object
	this.curColor = null; // detail object
	this.partsarray = []; // Array of parts object
	this.curSize = null; // size object
	this.curMatashita = -1;
	this.silarray = [];

	this.curSilhouetteTemplate = null; // String
	this.curDesignTemplate = null; // String
	this.curFullDesignTemplate = null; // String
	this.curPartsTemplate = null; // String
	this.curSizeTemplate = null; // String

	const onload_skipable = false;
	this.canvas_front = null;
	this.context_front = null;
	this.spec_front_width = -1;
	this.spec_front_height = -1;
	this.canvas_back = null;
	this.context_back = null;
	this.spec_back_width = -1;
	this.spec_back_height = -1;
	this.offimage = null;
	this.offctx = null;

	this.draw_pending = false;
	this.base = {};	// ベース images

	this.jscache = null;
	this.jsonroot = jsondata;
	if (jsondata != null)
		this.jscache = new NaviCacheHolder(jsondata);
}

//
//	Basket class method
//

Basket.prototype.set_canvas_front = function(canvas, context) {
	this.canvas_front = canvas;
	this.context_front = context;
	if (this.spec_front_width < 0)
	{
		this.spec_front_width = canvas.width;
		this.spec_front_height = canvas.height;
	}
}

Basket.prototype.get_canvas_front = function() {
	return this.canvas_front;
}

Basket.prototype.set_canvas_back = function(canvas, context) {
	this.canvas_back = canvas;
	this.context_back = context;
	if (this.spec_back_width < 0)
	{
		this.spec_back_width = canvas.width;
		this.spec_back_height = canvas.height;
	}
}

Basket.prototype.get_canvas_back = function() {
	return this.canvas_back;
}

Basket.prototype.set_offimage = function(canvas, context) {
	this.offimage = canvas;
	this.offctx = context;
}

Basket.prototype.get_offimage = function() {
	return this.offimage;
}

Basket.prototype.getSilhouetteTemplate = function() {
	return this.curSilhouetteTemplate;
}

Basket.prototype.getDesignTemplate = function() {
	return this.curDesignTemplate;
}

Basket.prototype.getSizeTemplate = function() {
	return this.curSizeTemplate;
}

Basket.prototype.getFullDesignTemplate = function() {
	return this.curFullDesignTemplate;
}

Basket.prototype.getItem = function() {
	return this.curItem;
}

Basket.prototype.getColor = function() {
	return this.curColor;
}

Basket.prototype.getSize = function() {
	return this.curSize;
}

Basket.prototype.getMatashita = function() {
	return this.curMatashita;
}

Basket.prototype.setItemNo = function(itemno) {
	return this.jscache.setItemNo(this, itemno);
}

Basket.prototype.getItemCache = function() {
	return this.jscache.itemArrayCache;
}

Basket.prototype.getColorCache = function() {
	return this.jscache.colorArrayCache;
}

Basket.prototype.getOptCache = function() {
	return this.jscache.optArrayCache;
}

Basket.prototype.getSizeCache = function() {
	return this.jscache.sizeArrayCache;
}

Basket.prototype.getSelectedParts = function(opt) {
	if (this.partsarray == null)
		return null;
	var partsobj;
	var rcode = null;
	for (var i = 0; i < this.partsarray.length; i++)
	{
		partsobj = this.partsarray[i];
		if (partsobj.opt == opt)
		{
			if (partsobj.partsCode != null)
				rcode = partsobj.partsCode;
			break;
		}
	}
	return rcode;
}

Basket.prototype.makePartsArray = function(optarray, partsTemplate)
{
	this.partsarray = [];
	if (optarray == null ||
	    optarray.length == 0)
	{
		this.curPartsTemplate = null;
		return;
	}
	this.curPartsTemplate = partsTemplate;
	var layobj;
	var selpart;
	for (i = 0; i < optarray.length; i++)
	{
		var layer = optarray[i];
		layobj = {};
		layobj.opt = layer['-code'];
		layobj.optobj = layer;
		layobj.name = layer['-name'];
		layobj.dress = layer['-dress'];
		this.partsarray.push(layobj);
		selpart = layer['-force'];
		if (selpart == null)
			selpart = layer['-default'];
		selectParts(this, layobj.opt, selpart, '');
	}
}

Basket.prototype.redraw = function(ifPending) {
	if (ifPending && !this.draw_pending)
		return;
	//alert('canvas_back=' + this.canvas_back + ' ' + this.context_back);
	if (this.canvas_front == null)
		alert('canvas_front is null');
	if (this.context_front == null)
		alert('context_front is null');
	// alert('redraw'); 
	if (this.curColor != null &&
	    (!this.base.fimage ||
    	     this.base.fimage.width <= 0 ||
    	     !this.base.bimage ||
    	     this.base.bimage.width <= 0))
	{
		//alert('base pending');
		this.draw_pending = true;
		return;
	}
	var i;
	var layobj;
	var img;
	for (i = 0; i < this.partsarray.length; i++)
	{
		layobj = this.partsarray[i];
		if (layobj.front != null && layobj.front != '')
		{
			img = layobj.fimage;
			if (img == null ||
		    	    img.width <= 0)
			{
				//alert('parts front pending ' + layobj.front);
				this.draw_pending = true;
				return;
			}
		}
		if (layobj.back != null && layobj.back != '')
		{
			img = layobj.bimage;
			if (img == null ||
		    	    img.width <= 0)
			{
				//alert('parts back pending ' + layobj.back);
				this.draw_pending = true;
				return;
			}
		}
	}
	for (i = 0; i < silarray.length; i++)
	{
		layobj = silarray[i];
		if (layobj.avatar_f != null && layobj.avatar_f != '')
		{
			img = layobj.fimage;
			if (img == null ||
		    	    img.width <= 0)
			{
				//alert('silhouette front pending ' + layobj.avatar_f);
				this.draw_pending = true;
				return;
			}
		}
		if (layobj.avatar_b != null && layobj.avatar_b != '')
		{
			img = layobj.bimage;
			if (img == null ||
		    	    img.width <= 0)
			{
				//alert('silhouette back pending ' + layobj.avatar_b);
				this.draw_pending = true;
				return;
			}
		}
	}
	//alert('now drawing');
	this.draw_pending = false;
	// alert('operation');

	var curop = this.offctx.globalCompositeOperation;
	try
	{
		if (this.canvas_front != null)
			makeImage(this, this.canvas_front, 0, 0, this.context_front, 'f', 2);
		if (this.canvas_back != null)
			makeImage(this, this.canvas_back, 0, 0, this.context_back, 'b', 1);
	}
	catch (e)
	{
		switch (typeof(e))
		{
			case 'object':
				var emsg = 'error:makeImage type=' + typeof(e);
				for (prop in e)
					emsg += ('e.' + prop + '=' + e[prop]);
				alert(emsg);
				break;
			case 'string':
				alert('error:makeImage message=' + e);
				break;
		} 
	}
	this.offctx.globalCompositeOperation = curop;

	function makeImage(pbasket, canvas, posx, posy, context, forb, whiteBoundary)
	{
		var basedt = null;
		var imgname = forb + 'image';
		var avtname = 'avatar_' + forb;
		var idtname = forb + 'imgdt';
		var imgwdt = -1, imghgt = -1;

		pbasket.offctx.globalCompositeOperation = 'source-over';
//alert(' !! 1');
		var spec_width;
		var spec_height;
		switch (forb)
		{
			case 'b':
				spec_width = pbasket.spec_back_width;
				spec_height = pbasket.spec_back_height;
				break;
			default:
				spec_width = pbasket.spec_front_width;
				spec_height = pbasket.spec_front_height;
				break;
		}
		var baseimg = pbasket.base[imgname];
		if (baseimg != null)
		{
			imgwdt = baseimg.width;
			imghgt = baseimg.height;
		}
		if (imgwdt <= 0 ||
		    imghgt <= 0)
		{
			baseimg = null;
			if (silarray.length > 0)
			{
				for (i = 0; i < silarray.length; i++)
				{
					imgwdt = silarray[0][imgname].width;
					imghgt = silarray[0][imgname].height;
					if (imgwdt > 0 &&
					    imghgt > 0)
						break;
				}
			}
			if (imgwdt <= 0 ||
			    imghgt <= 0)
			{
				// throw('ベース上場・シルエット情報がない');
				imgwdt = spec_width;
				imghgt = spec_height;
				if (imgwdt <= 0 ||
				    imghgt <= 0)
					throw('img error ' + imgwdt + 'X' + imghgt);
			}
		}

		var use_offline = false;
		if (pbasket.partsarray.length > 0 ||
		    silarray.length > 0)
			use_offline = true;
		// alert('makeImage(' + baseimg.width + ',' + baseimg.height + ') parts=' + pbasket.partsarray.length + ' sil=' + silarray.length);
		if (use_offline)
		{
			// canvas.width = 
			pbasket.offimage.width = imgwdt;
			// canvas.height =
			pbasket.offimage.height = imghgt;
		}

		var tgt_width = imgwdt;
		var tgt_height = imghgt;
		if (tgt_width > spec_width)
		{
			tgt_height *= (spec_width / tgt_width);
			tgt_height = Math.floor(tgt_height);
			tgt_width = spec_width;
		}
		else if (tgt_height > spec_height)
		{
			tgt_width *= (spec_height / tgt_height);
			tgt_width = Math.floor(tgt_width);
			tgt_height = spec_height;
		}

		if (use_offline)
		{
			if (baseimg != null)	
				pbasket.offctx.drawImage(baseimg, 0, 0);
			else
			{
				pbasket.offctx.fillStyle = 'rgb(255, 255, 255)';
				pbasket.offctx.fillRect(0, 0, imgwdt, imghgt);
			}
//alert(' !! 2');
			for (var i = 0; i < pbasket.partsarray.length; i++)
			{
				layobj = pbasket.partsarray[i];
				var layimg = layobj[imgname];
				if (layobj.partsCode != null &&
		       		    layimg != null)
					pbasket.offctx.drawImage(layimg, 0, 0);
			}
//alert(' !! 3');
			basedt = pbasket.offctx.getImageData(0, 0, imgwdt, imghgt);
			pbasket.offctx.globalCompositeOperation = 'copy';
		}
		else if (baseimg != null)
		{
			context.clearRect(0, 0, canvas.width, canvas.height);
			context.drawImage(baseimg, 0, 0, tgt_width, tgt_height);
		}

		var pic = imgwdt * imghgt;
		var avatar;
		var imgdt;
		var rgbv;
		for (i = 0; i < silarray.length; i++)
		{
			layobj = silarray[i];
// alert(' !! 4-' + i + ' (of ' + silarray.length + ') operation=' + layobj.operation);
			avatar = layobj[avtname];
			if (avatar == null || avatar == '')
				continue;
// alert(' !! 4-imgname=' + imgname);
			img = layobj[imgname];
			if (img == null ||
			    img.width <= 0)
				continue;
			imgdt = layobj[idtname];
			/***
			imgwdt = img.width;
			imghgt = img.height;
			if (imgwdt == 0 &&
			    imghgt == 0)
			{
				imghgt = baseimg.width;
				imgwdt = baseimg.height;
			}
			***/
			switch (layobj.operation)
			{
				case 'multiply':
					if (imgdt == null)
					{
	    					pbasket.offctx.drawImage(img, 0, 0);
	    					imgdt = pbasket.offctx.getImageData(0, 0, imgwdt, imghgt);
						layobj[idtname] = imgdt;
					}
					for (var j = 0; j < 4 * pic; j++)
					{
	    					rgbv = basedt.data[j] * imgdt.data[j] / 255;
	    					basedt.data[j] = (rgbv > 255 ? 255 : rgbv);
					}
					break;
				case 'add':
					if (imgdt == null)
					{
						pbasket.offctx.drawImage(img, 0, 0);
						imgdt = pbasket.offctx.getImageData(0, 0, imgwdt, imghgt);
						layobj[idtname] = imgdt;
					}
					for (var j = 0; j < 4 * pic; j++)
					{
						rgbv = basedt.data[j] + imgdt.data[j];
						basedt.data[j] = (rgbv > 255 ? 255 : rgbv);
					}
					break;
				case '%mask':
					if (imgdt == null)
					{
						pbasket.offctx.drawImage(img, 0, 0);
						imgdt = pbasket.offctx.getImageData(0, 0, imgwdt, imghgt);
						layobj[idtname] = imgdt;
					}
					for (var j = 0; j < pic; j++)
						basedt.data[4 * j + 3] = imgdt.data[4 * j];
					break;
				default:
					/*** backdtはうまく利用することが出来ない
					//if (backdt == undefined)
					{
						pbasket.offctx.drawImage(backimg, 0, 0);
   						backdt = pbasket.offctx.getImageData(0, 0, backimg.width, backimg.height);
					}
					***/
					if (basedt != null)
					{
						context.putImageData(basedt, posx, posy);
						basedt = null;
					}
    					context.drawImage(layobj[imgname], posx, posy, tgt_width, tgt_height);
			}
		}
//alert('before the last putImageData');
		if (basedt != null)
		{
			context.putImageData(basedt, posx, posy);
		}
		if (whiteBoundary > 0)
		{
			context.strokeStyle = '#FFFFFF';
			context.lineWidth = 2;
			for (i = 0; i < whiteBoundary; i++)
			{
				context.beginPath();
				context.moveTo(i, i);
				context.lineTo(i, tgt_height - i - 1);
				context.lineTo(tgt_width - i - 1, tgt_height - i - 1);
				context.lineTo(tgt_width - i - 1, i);
				context.closePath();
				context.stroke();
			}
		}
	}
}

Basket.prototype.setItem = function(item)
{
	if (item == this.curItem)
		return;
	var clear_color = false;
	var refresh_color = false;
	var clear_parts = false;
	var refresh_parts = false;
	var clear_size = false;
	var dirty = false;
	// alert('chItemImg alt=' + opt.alt);
	var designtemp = item['-designTemplate'];
	var sub = item['-sub'];
	var siltemp = item['-silhouetteTemplate'];
	var partstemp = item['-partsTemplate'];
	var sizetemp = item['-sizeTemplate'];
	var fulldesigntemp = designtemp ? designtemp + sub : null;

	if (designtemp == null ||
    	    designtemp != this.curDesignTemplate)
		clear_color = dirty = true;
	else if (fulldesigntemp != this.curFullDesignTemplate)
		refresh_color = refresh_parts = true;
	if (siltemp != this.curSilhouetteTemplate)
		dirty = true;
	if (partstemp != this.curPartsTemplate)
		clear_parts = dirty = true;
	if (sizetemp == null ||
	    sizetemp != this.curSizeTemplate)
		clear_size = true;

	this.curItem = item;
	this.curDesignTemplate = designtemp;
	this.curFullDesignTemplate = fulldesigntemp;
	this.curSizeTemplate = sizetemp;
	var typeObj = null;
	if (clear_color)
		this.setColor(null);
	else if (refresh_color)
	{
		var colcode = this.curColor['-code'];
		var typcode = this.curType['-code'];
		this.curColor = null;
		this.curType = null;
		var design = null;
		var designlist = this.jscache.getTemplateCollection().DesignTemplate;
		var i;
		for (i = 0; i < designlist.length; i++)
		{
			if (designlist[i]['-id'] == fulldesigntemp)
			{
				design = designlist[i];
				break;
			}
		}
		var typeL = design.TypeList.Type;
		for (i = 0; i < typeL.length; i++)
		{
			if (typeL[i]['-code'] == typcode)
			{
				typeObj = typeL[i];
				var collist = typeObj.detail;
				for (var j = 0; j < collist.length; j++)
				{
					if (collist[j]['-code'] == colcode)
					{
						this.curType = typeObj;
						this.curColor = collist[j];
						dress(this);
						break;
					}
				}
				break;
			}
		}
	}
	if (clear_parts)
		this.partsarray = [];
	if (clear_size)
	{
		this.curSize = null;
		this.curMatashita = -1;
	}
	else if (refresh_parts)
		refreshParts(this);
	if (siltemp != this.curSilhouetteTemplate)
		makeSilhouetteImagesFromTemplate(this, siltemp);
	if (dirty)
		this.redraw(false);

	function makeSilhouetteImagesFromTemplate(pbasket, templateId)
	{
		if (templateId == pbasket.curSilhouetteTemplate)
			return;
		pbasket.curSilhouetteTemplate = templateId;
		if (!pbasket.curSilhouetteTemplate)
		{
			silarray = [];
			return;
		}

		var silhouette; 
		var sillist = pbasket.jscache.getTemplateCollection().SilhouetteTemplate;
		for (i = 0; i < sillist.length; i++)
		{
			if (sillist[i]['-id'] == templateId)
			{
				silhouette = sillist[i];
				break;
			}
		}
		var laylist = silhouette.Layer;
		silarray = [];
		var layobj;
		var nimage;
		var avatarf;
		for (i = 0; i < laylist.length; i++)
		{
			var layer = laylist[i];
			layobj = {};
			layobj.id = layer['-id'];
			layobj.operation = layer['-operation'];
			avatarf = layer['-avatar_f'];
			layobj.avatar_f = avatarf;
			avatarb = layer['-avatar_b'];
			layobj.avatar_b = avatarb;
			silarray.push(layobj);
			if (avatarf != null && avatarf != '')
			{
				layobj.fimage = nimage = new Image();
				nimage.crossOrigin = 'anonymous';
				nimage.silfile = avatarf;
				nimage.onload = function() {
					console.log('silhouette front image loaded:' + this.silfile);
					pbasket.redraw(true);
				}
				nimage.onerror = function() {
					layobj.fimage = null;
					console.log('silhouette image load error:' + this.silfile);
					pbasket.redraw(true);
				}
				nimage.src = avatarf;
			}
			if (avatarb != null && avatarb != '')
			{
				layobj.bimage = nimage = new Image();
				nimage.crossOrigin = 'anonymous';
				nimage.silfile = avatarb;
				nimage.onload = function() {
					console.log('silhouette back image loaded:' + this.silfile)
					pbasket.redraw(true);
				}
				nimage.onerror = function() {
					layobj.bimage = null;
					console.log('silhouette image load error:' + this.silfile);
					pbasket.redraw(true);
				}
				nimage.src = avatarb;
			}
		}
	}
}

Basket.prototype.setColor = function(color)
{
	var refresh = false;
	// alert('setColor(' + color + ')');
	if (color == null &&
    	    this.curColor == null)
		return;
	if (color == this.curColor)
		return;
	if (this.curColor != null)
	{
		if (color == null)
		{
			this.partsarray = [];
			refresh = true;
		}
		else if (this.jscache.parentTypeOf(color)['-partsFolder'] != this.curType['-partsFolder'])
			refresh = true;
	}
	this.curType = this.jscache.parentTypeOf(color);
	this.curColor = color;
	dress(this);
	if (refresh)
		refreshParts(this);
	this.redraw(false);
}

Basket.prototype.setSize = function(size)
{
	// alert('setColor(' + color + ')');
	if (size == null &&
    	    this.curSize == null)
		return;
	if (size == this.curSize)
		return;
	this.curSize = size;
}

Basket.prototype.setSizeIndex = function(index)
{
	this.setSize(index >= 0 ? this.jscache.sizeArrayCache[index] : null);
}

Basket.prototype.setMatashita = function(len)
{
	// alert('setColor(' + color + ')');
	if (len < 0 &&
    	    this.curMatshita < 0)
		return;
	if (len == this.curMatashita)
		return;
	this.curMatashita = len;
}

Basket.prototype.SelectParts = function(opt, code)
{	
	return selectParts(this, opt, code, 'toggle');

}

function selectParts(pbasket, opt, code, mode)
{	
	var i;
	var layobj = null;
	for (i = 0; i < pbasket.partsarray.length; i++)
	{
		if (pbasket.partsarray[i].opt == opt)
		{
			layobj = pbasket.partsarray[i];
			break;
		}
	}
	if (layobj == null)
		return -1;
	var layer = layobj.optobj;
	if (layer == null)
		return -1;

	if (code == null)
		code = layer['-force'];
	if (code == null)
	{
		if (layobj.partsCode != null)
		{
			layobj.partsCode = null;
			layobj.front = null;
			layobj.back = null;
			layobj.fimage = null;
			layobj.bimage = null;
			switch (mode)
			{
				case 'immediate':
				case 'toggle':
					pbasket.redraw(false);
			}
		}
		return -1;
	}
	var local_partsarray = layer.parts;
	if (!Array.isArray(local_partsarray))
		local_partsarray = [layer.parts];
	var partsobj;
	var partsFolder = pbasket.curType['-partsFolder'];
	for (i = 0; i < local_partsarray.length; i++)
	{
		partsobj = local_partsarray[i];
		if (partsobj['-code'] == code)
		{
			var immediateDraw = false;
			if (mode == 'toggle' && layobj.partsCode == code)
			{
				var resetval = layer['-default'];
				if (resetval == null)
					resetval = layer['-force'];

				return selectParts(pbasket, opt, resetval, 'immediate');
			}
			layobj.fimage = layobj.bimage = null;
			layobj.partsCode = code;
			layobj.front = partsobj['-front'];
			if (layobj.front != null &&
		    	    layobj.front != '')
			{
				nimage = new Image();
				nimage.crossOrigin = 'anonymous';
				var partsFile = partsFolder + layobj.front;
				layobj.fimage = nimage;
				nimage.partsfile = partsFile;
				nimage.onload = function() {
					console.log('parts image loaded:' + this.partsfile);
					pbasket.redraw(true);
				}
				nimage.onerror = function() {
					layobj.fimage = null;
					// console.log('parts image load error:' + this.partsfile);
					if (defaultPartsFileLoad(pbasket, layobj, partsFile, true) == null)
						pbasket.redraw(true);
				}
				nimage.src = partsFile;
				if (Basket.onload_skipable && nimage.width > 0)
					immediateDraw = true;
			}

			layobj.back = partsobj['-back'];
			if (layobj.back != null &&
		    	    layobj.back != '')
			{
				nimage = new Image();
				nimage.crossOrigin = 'anonymous';
				var partsFile = partsFolder + layobj.back;
				layobj.bimage = nimage;
				nimage.partsfile = partsFile;
				nimage.onload = function() {
					console.log('parts image loaded:' + this.partsfile);
					pbasket.redraw(true);
				}
				nimage.onerror = function() {
					layobj.bimage = null;
					// console.log('parts image load error:' + this.partsfile);
					if (defaultPartsFileLoad(pbasket, layobj, partsFile, false) == null)
						pbasket.redraw(true);
				}
				nimage.src = partsFile;
				if (Basket.onload_skipable && nimage.width > 0)
					immediateDraw = true;
			}

			switch (mode)
			{
				case 'immediate':
				case 'toggle':
					immediateDraw = true;
			}
			if (immediateDraw)
				pbasket.redraw(false);
			return i;
		}
	}
	return -1;

	function defaultPartsFileLoad(pbasket, layobj, partsFile, foreground)
	{
		var repstr = partsFile.replace(/\/PNP\d\d/, '/PNP00');
		if (repstr == partsFile)
			return null;
		nimage = new Image();
		nimage.crossOrigin = 'anonymous';
		if (foreground)
			layobj.fimage = nimage;
		else
			layobj.bimage = nimage;
		nimage.partsfile = repstr;
		nimage.onload = function() {
			console.log('parts image loaded:' + this.partsfile);
			pbasket.redraw(true);
		}
		nimage.onerror = function() {
			if (foreground)
				layobj.fimage = null;
			else
				layobj.bimage = null;
			console.log('parts image reload error:' + this.partsfile);
			pbasket.redraw(true);
		}
		nimage.src = repstr;
		return repstr;
	}
}

function dress(pbasket) {
	pbasket.base.fimage = pbasket.base.bimage = null;

	// ベースImageオブジェクトを生成
	if (pbasket.curColor != null)
	{
		var color_f = pbasket.curColor['-avatar_f'];
		var color_b = pbasket.curColor['-avatar_b'];
		var fimg = null, bimg = null;
		if (color_f != null && color_f != '')
		{
			fimg = pbasket.base.fimage = new Image();
			fimg.crossOrigin = 'anonymous';
			fimg.colfile = color_f;
			fimg.onload = function() {
				console.log('front base image loaded:' + this.colfile);
				pbasket.redraw(true);
			}
			fimg.onerror = function() {
				pbasket.base.fimage = null;
				console.log('base image load error:' + this.colfile);
				pbasket.redraw(true);
			}
			fimg.src = color_f;
		}
		if (color_b != null && color_b != '')
		{
			bimg = pbasket.base.bimage = new Image();
			bimg.crossOrigin = 'anonymous';
			bimg.colfile = color_b;
			bimg.onload = function() {
				console.log('back base image loaded:' + this.colfile);
				pbasket.redraw(true);
			}
			bimg.onerror = function() {
				pbasket.base.bimage = null;
				console.log('base image load error:' + this.colfile);
				pbasket.redraw(true);
			}
			bimg.src = color_b;
		}

		if (Basket.onload_skipable &&
		    (fimg == null ||
		     fimg.width > 0) &&
		    (bimg == null ||
		     bimg.width > 0))
			pbasket.redraw(false);
	}
}

function refreshParts(pbasket)
{
	var layobj;
	for (var i = 0; i < pbasket.partsarray.length; i++)
	{
		layobj = pbasket.partsarray[i];
		selectParts(pbasket, layobj.opt, layobj.partsCode, '');
	}
}
-->
