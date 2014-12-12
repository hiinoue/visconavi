<!--
// Basket.js
var Basket = function() {
	const onload_skipable = false;
	var canvas_front = null;
	var context_front = null;
	var spec_front_width = -1;
	var spec_front_height = -1;
	var canvas_back = null;
	var context_back = null;
	var spec_back_width = -1;
	var spec_back_height = -1;
	var offimage = null;
	var offctx = null;

	this.jsonroot = null;
	var curSilhouetteTemplate = null; // String
	var curDesignTemplate = null; // String
	var curFullDesignTemplate = null; // String
	var curPartsTemplate = null; // String
	var curSizeTemplate = null; // String

	var curItem = null; // Item object
	var curType = null; // Type object
	var curColor = null; // detail object
	var curSize = null; // size object
	var curMatashita = -1;

	var now_drawing = false;
	var draw_pending = false;
	var base = {};	// ベース images
	var partsarray = []; // Array of parts object
	var silarray = [];

	this.set_canvas_front = function(canvas, context) {
		canvas_front = canvas;
		context_front = context;
		if (spec_front_width < 0)
		{
			spec_front_width = canvas.width;
			spec_front_height = canvas.height;
		}
	}
	this.get_canvas_front = function() {
		return canvas_front;
	}
	this.set_canvas_back = function(canvas, context) {
		canvas_back = canvas;
		context_back = context;
		if (spec_back_width < 0)
		{
			spec_back_width = canvas.width;
			spec_back_height = canvas.height;
		}
	}
	this.get_canvas_back = function() {
		return canvas_back;
	}
	this.set_offimage = function(canvas, context) {
		offimage = canvas;
		offctx = context;
	}
	this.get_offimage = function() {
		return offimage;
	}

	this.getSilhouetteTemplate = function() {
		return curSilhouetteTemplate;
	}
	this.getDesignTemplate = function() {
		return curDesignTemplate;
	}
	this.getSizeTemplate = function() {
		return curSizeTemplate;
	}
	this.getFullDesignTemplate = function() {
		return curFullDesignTemplate;
	}

	this.getItem = function() {
		return curItem;
	}
	this.getColor = function() {
		return curColor;
	}

	this.getSize = function() {
		return curSize;
	}

	this.getMatashita = function() {
		return curMatashita;
	}

	this.getSelectedParts = function(opt) {
		if (partsarray == null)
			return null;
		var partsobj;
		var rcode = null;
		for (var i = 0; i < partsarray.length; i++)
		{
			partsobj = partsarray[i];
			if (partsobj.opt == opt)
			{
				if (partsobj.partsCode != null)
					rcode = partsobj.partsCode;
				break;
			}
		}
		return rcode;
	}

	function makeSilhouetteImagesFromTemplate(jsondata, templateId)
	{
		if (templateId == curSilhouetteTemplate)
			return;
		curSilhouetteTemplate = templateId;
		if (!curSilhouetteTemplate)
		{
			silarray = [];
			return;
		}

		var silhouette; 
		var sillist = getTemplateCollection(jsondata).SilhouetteTemplate;
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
					//alert('silhouette front loaded');
					redraw(true);
				}
				nimage.onerror = function() {
					layobj.fimage = null;
					console.log('silhouette image load error:' + this.silfile);
					redraw(true);
				}
				nimage.src = avatarf;
			}
			if (avatarb != null && avatarb != '')
			{
				layobj.bimage = nimage = new Image();
				nimage.crossOrigin = 'anonymous';
				nimage.silfile = avatarb;
				nimage.onload = function() {
					//alert('silhouette back loaded')
					redraw(true);
				}
				nimage.onerror = function() {
					layobj.bimage = null;
					console.log('silhouette image load error:' + this.silfile);
					redraw(true);
				}
				nimage.src = avatarb;
			}
		}
	}

	this.makePartsArray = function(optarray, partsTemplate)
	{
		partsarray = [];
		if (optarray == null ||
		    optarray.length == 0)
		{
			curPartsTemplate = null;
			return;
		}
		curPartsTemplate = partsTemplate;
		var layobj;
		var selpart;
		var nimage;
		var avatarf;
		for (i = 0; i < optarray.length; i++)
		{
			var layer = optarray[i];
			layobj = {};
			layobj.opt = layer['-code'];
			layobj.optobj = layer;
			layobj.name = layer['-name'];
			layobj.dress = layer['-dress'];
			partsarray.push(layobj);
			selpart = layer['-force'];
			if (selpart == null)
				selpart = layer['-default'];
			selectParts(layobj.opt, selpart, '');
		}
	}

	function dress() {
		base.fimage = base.bimage = null;

		// ベースImageオブジェクトを生成
		if (curColor != null)
		{
			var color_f = curColor['-avatar_f'];
			var color_b = curColor['-avatar_b'];
			var fimg = null, bimg = null;
			if (color_f != null && color_f != '')
			{
				fimg = base.fimage = new Image();
				fimg.crossOrigin = 'anonymous';
				fimg.colfile = color_f;
				fimg.onload = function() {
					console.log('front base image loaded:' + this.colfile);
					redraw(true);
				}
				fimg.onerror = function() {
					base.fimage = null;
					console.log('base image load error:' + this.colfile);
					redraw(true);
				}
				fimg.src = color_f;
			}
			if (color_b != null && color_b != '')
			{
				bimg = base.bimage = new Image();
				bimg.crossOrigin = 'anonymous';
				bimg.colfile = color_b;
				bimg.onload = function() {
					console.log('back base image loaded:' + this.colfile);
					redraw(true);
				}
				bimg.onerror = function() {
					base.bimage = null;
					console.log('base image load error:' + this.colfile);
					redraw(true);
				}
				bimg.src = color_b;
			}

			if (onload_skipable &&
			    (fimg == null ||
			     fimg.complete) &&
			    (bimg == null ||
			     bimg.complete))
				redraw(false);
		}
	}

	function redraw(ifPending) {
		// if (now_drawing) return;
		if (ifPending && !draw_pending)
			return;
		//alert('canvas_back=' + canvas_back + ' ' + context_back);
		if (canvas_front == null)
			alert('canvas_front is null');
		if (context_front == null)
			alert('context_front is null');
		// alert('redraw'); 
		if (curColor != null &&
		    (!base.fimage ||
	    	     !base.fimage.complete ||
	    	     !base.bimage ||
	    	     !base.bimage.complete))
		{
			//alert('base pending');
			draw_pending = true;
			return;
		}
		var i;
		var layobj;
		var img;
		for (i = 0; i < partsarray.length; i++)
		{
			layobj = partsarray[i];
			if (layobj.front != null && layobj.front != '')
			{
				img = layobj.fimage;
				if (img == null ||
			    	    !img.complete ||
				    img.width <= 0)
				{
					//alert('parts front pending ' + layobj.front);
					draw_pending = true;
					return;
				}
			}
			if (layobj.back != null && layobj.back != '')
			{
				img = layobj.bimage;
				if (img == null ||
			    	    !img.complete ||
				    img.width <= 0)
				{
					//alert('parts back pending ' + layobj.back);
					draw_pending = true;
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
			    	    !img.complete)
				{
					//alert('silhouette front pending ' + layobj.avatar_f);
					draw_pending = true;
					return;
				}
			}
			if (layobj.avatar_b != null && layobj.avatar_b != '')
			{
				img = layobj.bimage;
				if (img == null ||
			    	    !img.complete)
				{
					//alert('silhouette back pending ' + layobj.avatar_b);
					draw_pending = true;
					return;
				}
			}
		}
		//alert('now drawing');
		//now_drawing = true;
		draw_pending = false;
		// alert('operation');

		var curop = offctx.globalCompositeOperation;
		try
		{
			if (canvas_front != null)
				makeImage(canvas_front, 0, 0, context_front, 'f', 2);
			if (canvas_back != null)
				makeImage(canvas_back, 0, 0, context_back, 'b', 1);
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
		offctx.globalCompositeOperation = curop;
		//now_drawing = false;

		function makeImage(canvas, posx, posy, context, forb, whiteBoundary)
		{
			var basedt = null;
			var imgname = forb + 'image';
			var avtname = 'avatar_' + forb;
			var idtname = forb + 'imgdt';
			var imgwdt = -1, imghgt = -1;

			offctx.globalCompositeOperation = 'source-over';

//alert(' !! 1');
			var spec_width;
			var spec_height;
			switch (forb)
			{
				case 'b':
					spec_width = spec_back_width;
					spec_height = spec_back_height;
					break;
				default:
					spec_width = spec_front_width;
					spec_height = spec_front_height;
					break;
			}
			var baseimg = base[imgname];
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
			if (partsarray.length > 0 ||
			    silarray.length > 0)
				use_offline = true;
			// alert('makeImage(' + baseimg.width + ',' + baseimg.height + ') parts=' + partsarray.length + ' sil=' + silarray.length);
			if (use_offline)
			{
				// canvas.width = 
				offimage.width = imgwdt;
				// canvas.height =
				offimage.height = imghgt;
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
     					offctx.drawImage(baseimg, 0, 0);
				else
				{
					offctx.fillStyle = 'rgb(255, 255, 255)';
					offctx.fillRect(0, 0, imgwdt, imghgt);
				}
//alert(' !! 2');
				for (var i = 0; i < partsarray.length; i++)
				{
					layobj = partsarray[i];
					var layimg = layobj[imgname];
					if (layobj.partsCode != null &&
			       		    layimg != null)
    						offctx.drawImage(layimg, 0, 0);
				}
//alert(' !! 3');
				basedt = offctx.getImageData(0, 0, imgwdt, imghgt);
				offctx.globalCompositeOperation = 'copy';
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
				    !img.complete)
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
		    					offctx.drawImage(img, 0, 0);
		    					imgdt = offctx.getImageData(0, 0, imgwdt, imghgt);
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
	    						offctx.drawImage(img, 0, 0);
	    						imgdt = offctx.getImageData(0, 0, imgwdt, imghgt);
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
	    						offctx.drawImage(img, 0, 0);
	    						imgdt = offctx.getImageData(0, 0, imgwdt, imghgt);
							layobj[idtname] = imgdt;
						}
						for (var j = 0; j < pic; j++)
	    						basedt.data[4 * j + 3] = imgdt.data[4 * j];
						break;
					default:
						/*** backdtはうまく利用することが出来ない
						//if (backdt == undefined)
						{
	     					offctx.drawImage(backimg, 0, 0);
   							backdt = offctx.getImageData(0, 0, backimg.width, backimg.height);
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

	function refreshParts()
	{
		var layobj;
		for (var i = 0; i < partsarray.length; i++)
		{
			layobj = partsarray[i];
			selectParts(layobj.opt, layobj.partsCode, '');
		}
	}

	this.setItem = function(item)
	{
		if (item == curItem)
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
	    	    designtemp != curDesignTemplate)
			clear_color = dirty = true;
		else if (fulldesigntemp != curFullDesignTemplate)
			refresh_color = refresh_parts = true;
		if (siltemp != curSilhouetteTemplate)
			dirty = true;
		if (partstemp != curPartsTemplate)
			clear_parts = dirty = true;
		if (sizetemp == null ||
		    sizetemp != curSizeTemplate)
			clear_size = true;

		curItem = item;
		curDesignTemplate = designtemp;
		curFullDesignTemplate = fulldesigntemp;
		curSizeTemplate = sizetemp;
		var typeObj = null;
		if (clear_color)
			this.setColor(null);
		else if (refresh_color)
		{
			var colcode = curColor['-code'];
			var typcode = curType['-code'];
			curColor = null;
			curType = null;
			var design = null;
			var designlist = getTemplateCollection(this.jsonroot).DesignTemplate;
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
							curType = typeObj;
							curColor = collist[j];
							dress();
							break;
						}
					}
					break;
				}
			}
		}
		if (clear_parts)
			partsarray = [];
		if (clear_size)
		{
			curSize = null;
			curMatashita = -1;
		}
		else if (refresh_parts)
			refreshParts();
		if (siltemp != curSilhouetteTemplate)
			makeSilhouetteImagesFromTemplate(this.jsonroot, siltemp);
		if (dirty)
			redraw(false);
	}

	this.setColor = function(color)
	{
		// alert('setColor(' + color + ')');
		if (color == null &&
	    	    curColor == null)
			return;
		if (color == curColor)
			return;
		if (curColor != null)
		{
			if (color == null)
				partsarray = [];
			else if (parentTypeOf(color)['-partsFolder'] != curType['-partsFolder'])
				refreshParts();
		}
		curType = parentTypeOf(color);
		curColor = color;
		dress();
		redraw(false);
	}

	this.setSize = function(size)
	{
		// alert('setColor(' + color + ')');
		if (size == null &&
	    	    curSize == null)
			return;
		if (size == curSize)
			return;
		curSize = size;
	}

	this.setMatashita = function(len)
	{
		// alert('setColor(' + color + ')');
		if (len < 0 &&
	    	    curMatshita < 0)
			return;
		if (len == curMatashita)
			return;
		curMatashita = len;
	}

	function defaultPartsFileLoad(layobj, partsFile, foreground)
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
		nimage.partsfile = partsFile;
		nimage.onload = function() {
			redraw(true);
		}
		nimage.onerror = function() {
			if (foreground)
				layobj.fimage = null;
			else
				layobj.bimage = null;
			console.log('parts image reload error:' + this.partsfile);
			redraw(true);
		}
		nimage.src = repstr;
		return repstr;
	}

	function selectParts(opt, code, mode)
	{	
		var i;
		var layobj = null;
		for (i = 0; i < partsarray.length; i++)
		{
			if (partsarray[i].opt == opt)
			{
				layobj = partsarray[i];
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
						redraw(false);
				}
			}
			return -1;
		}
		var local_partsarray = layer.parts;
		if (!Array.isArray(local_partsarray))
			local_partsarray = [layer.parts];
		var pasrtobj;
		var partsFolder = curType['-partsFolder'];
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
	
					return selectParts(opt, resetval, 'immediate');
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
						redraw(true);
					}
					nimage.onerror = function() {
						layobj.fimage = null;
						// console.log('parts image load error:' + this.partsfile);
						if (defaultPartsFileLoad(layobj, partsFile, true) == null)
							redraw(true);
					}
					nimage.src = partsFile;
					if (onload_skipable && nimage.complete)
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
						redraw(true);
					}
					nimage.onerror = function() {
						layobj.bimage = null;
						// console.log('parts image load error:' + this.partsfile);
						if (defaultPartsFileLoad(layobj, partsFile, false) == null)
							redraw(true);
					}
					nimage.src = partsFile;
					if (onload_skipable && nimage.complete)
						immediateDraw = true;
				}

				switch (mode)
				{
					case 'immediate':
					case 'toggle':
						immediateDraw = true;
				}
				if (immediateDraw)
					redraw(false);
				return i;
			}
		}
		return -1;
	}

	this.SelectParts = function(opt, code)
	{	
		return selectParts(opt, code, 'toggle');
	}
}

function parentTypeOf(color)
{
	var type = null;
	for (var i = 0; i < colorArrayCache.length; i++)
	{
		if (color == colorArrayCache[i])
		{
			type = typeArrayCache[i];
			break;
		}
	}
	return type;		
}
-->
