<!--
// Basket.js
var Basket = function(jsondata) {
	this.canvas_front = null;
	this.canvas_back = null;
	this.clear();

	this.jsonroot = jsondata;
	if (jsondata != null)
		this.jscache = new NaviCacheHolder(jsondata);
}

Basket.prototype.clear = function() {
	// 残っているcanvasイメージをクリア
	if (this.canvas_front != null)
		this.context_front.clearRect(0, 0, this.canvas_front.width, this.canvas_front.height);
	if (this.canvas_back != null)
		this.context_back.clearRect(0, 0, this.canvas_back.width, this.canvas_back.height);
	this.wk_canvas = null;
	this.base64array = [];
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
	this.posx = -1;
	this.posy = -1;
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
}
//
//	Basket class method
//

Basket.prototype.set_canvas_front = function(canvas, context) {
	this.canvas_front = canvas;
	this.context_front = context;
	if (this.spec_front_width < 0 && 
	    canvas.width != null &&
	    canvas.height != null)
	{
		this.spec_front_width = canvas.width;
		this.spec_front_height = canvas.height;
	}
	if (this.offimg == null) {
		this.offimage = document.createElement('canvas');
		this.offctx = this.offimage.getContext('2d');
	}
}

Basket.prototype.get_canvas_front = function() {
	return this.canvas_front;
}

Basket.prototype.set_canvas_back = function(canvas, context) {
	this.canvas_back = canvas;
	this.context_back = context;
	if (this.spec_back_width < 0 &&
	    canvas.width != null &&
	    canvas.height != null)
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
		layobj.optname = layer['-name'];
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
	for (i = 0; i < this.silarray.length; i++)
	{
		layobj = this.silarray[i];
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
			makeImage(this, this.canvas_front, this.posx, this.posy, this.context_front, 'f', 2);
		if (this.canvas_back != null)
			makeImage(this, this.canvas_back, this.posx, this.posy, this.context_back, 'b', 1);
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
				spec_width = Number(pbasket.spec_back_width);
				spec_height = Number(pbasket.spec_back_height);
				break;
			default:
				spec_width = Number(pbasket.spec_front_width);
				spec_height = Number(pbasket.spec_front_height);
				break;
		}
		var baseimg = pbasket.base[imgname];
		if (baseimg != null)
		{
			imgwdt = Number(baseimg.width);
			imghgt = Number(baseimg.height);
		}
		if (imgwdt <= 0 ||
		    imghgt <= 0)
		{
			baseimg = null;
			if (pbasket.silarray.length > 0)
			{
				for (i = 0; i < pbasket.silarray.length; i++)
				{
					imgwdt = pbasket.silarray[0][imgname].width;
					imghgt = pbasket.silarray[0][imgname].height;
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
		var fill_white = true;
		if (pbasket.partsarray.length > 0 ||
		    pbasket.silarray.length > 0)
			use_offline = true;
		// alert('makeImage(' + baseimg.width + ',' + baseimg.height + ') parts=' + pbasket.partsarray.length + ' sil=' + pbasket.silarray.length);

		var tgt_width = imgwdt;
		var tgt_height = imghgt;
		var adjustWidth = false;
		var adjustHeight = false;
		var w_rate = Math.floor(spec_width / tgt_width);
		var h_rate = Math.floor(spec_height / tgt_height);
		if (Number(w_rate) >= 1.0 && Number(h_rate) >= 1.0) {
			var wh_rate = Number(w_rate) > Number(h_rate) ? h_rate : w_rate;
			tgt_width *= wh_rate;
			tgt_height *= wh_rate;
		} else if (tgt_width > spec_width)
		{
			if (tgt_height > spec_height)
			{
				if (spec_width * tgt_height < spec_height * tgt_width)
					adjustWidth = true;
				else
					adjustHeight = true;
			}
			else
				adjustWidth = true;
		}
		else if (tgt_height > spec_height)
			adjustHeight = true;

		if (adjustWidth)
		{
			tgt_height *= (spec_width / tgt_width);
			tgt_height = Math.floor(tgt_height);
			tgt_width = spec_width;
		}
		else if (adjustHeight)
		{
			tgt_width *= (spec_height / tgt_height);
			tgt_width = Math.floor(tgt_width);
			tgt_height = spec_height;
		}
		if (posx < 0)
		{
			posx = (canvas.width - tgt_width) / 2;
		}
		if (posy < 0)
		{
			posy = (canvas.height - tgt_height) / 2;
		}

		// 背景塗りつぶし
		if (fill_white) { // 透明な黒ではなく不透明な白で塗りつぶす?
			context.fillStyle = 'rgb(255, 255, 255)';
			context.fillRect(0, 0, canvas.width, canvas.height);
		} else { //  透明な黒でクリアする？
			context.clearRect(0, 0, canvas.width, canvas.height);
		}
		if (use_offline)
		{
			offimg = pbasket.offimage;
			// canvas.width =
			offimg.width = tgt_width; // imgwdt;
			// canvas.height =
			offimg.height = tgt_height; // imghgt;

			pbasket.offctx.fillStyle = 'rgb(255, 255, 255)';
			pbasket.offctx.fillRect(0, 0, offimg.width, offimg.height);
			///// pbasket.offctx.clearRect(0, 0, offimg.width, offimg.height);
			if (baseimg != null)
				pbasket.offctx.drawImage(baseimg, 0, 0, tgt_width, tgt_height);
//alert(' !! 2');
			for (var i = 0; i < pbasket.partsarray.length; i++)
			{
				layobj = pbasket.partsarray[i];
				var layimg = layobj[imgname];
				if (layobj.partsCode != null &&
		       		    layimg != null)
					pbasket.offctx.drawImage(layimg, 0, 0, tgt_width, tgt_height);
			}
//alert(' !! 3');
			basedt = pbasket.offctx.getImageData(0, 0, tgt_width, tgt_height);
			pbasket.offctx.globalCompositeOperation = 'copy';
		}
		else if (baseimg != null)
		{
			context.drawImage(baseimg, posx, posy, tgt_width, tgt_height);
		}

		var pic = tgt_width * tgt_height;
		var avatar;
		var imgdt;
		var rgbv;
		for (i = 0; i < pbasket.silarray.length; i++)
		{
			layobj = pbasket.silarray[i];
// alert(' !! 4-' + i + ' (of ' + pbasket.silarray.length + ') operation=' + layobj.operation);
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
	    					pbasket.offctx.drawImage(img, 0, 0, tgt_width, tgt_height);
	    					imgdt = pbasket.offctx.getImageData(0, 0, tgt_width, tgt_height);
						layobj[idtname] = imgdt;
					}
					for (var j = 0; j < 4 * pic; j++)
					{
						if (j % 4 != 3)
						{
	    						rgbv = basedt.data[j] * imgdt.data[j] / 255;
	    						basedt.data[j] = (rgbv > 255 ? 255 : rgbv);
						}
					}
					break;
				case 'add':
					if (imgdt == null)
					{
						pbasket.offctx.drawImage(img, 0, 0, tgt_width, tgt_height);
						imgdt = pbasket.offctx.getImageData(0, 0, tgt_width, tgt_height);
						layobj[idtname] = imgdt;
					}
					for (var j = 0; j < 4 * pic; j++)
					{
						if (j % 4 != 3)
						{
							rgbv = basedt.data[j] + imgdt.data[j];
							basedt.data[j] = (rgbv > 255 ? 255 : rgbv);
						}
					}
					break;
				case '%mask':
					if (imgdt == null)
					{
						pbasket.offctx.drawImage(img, 0, 0, tgt_width, tgt_height);
						imgdt = pbasket.offctx.getImageData(0, 0, tgt_width, tgt_height);
						layobj[idtname] = imgdt;
					}
					for (var j = 0; j < pic; j++)
						basedt.data[4 * j + 3] = imgdt.data[4 * j];
					break;
				default:
					/*** backdtはうまく利用することが出来ない
					//if (backdt == undefined)
					{
						pbasket.offctx.drawImage(backimg, 0, 0, tgt_width, tgt_height);
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
		/****
		if (whiteBoundary > 0)
		{
			context.strokeStyle = '#FFFFFF';
			context.lineWidth = 2;
			for (i = 0; i < whiteBoundary; i++)
			{
				context.beginPath();
				context.moveTo(posx + i, posy + i);
				context.lineTo(posx + i, posy + tgt_height - i - 1);
				context.lineTo(posx + tgt_width - i - 1, posy + tgt_height - i - 1);
				context.lineTo(posx + tgt_width - i - 1, posy + i);
				context.closePath();
				context.stroke();
			}
		}
		****/
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
			pbasket.silarray = [];
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
		pbasket.silarray = [];
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
			pbasket.silarray.push(layobj);
			if (avatarf != null && avatarf != '')
			{
				loadAnImageFile(pbasket, layobj, "fimage", avatarf, false, 'front silhouette image');
			}
			if (avatarb != null && avatarb != '')
			{
				loadAnImageFile(pbasket, layobj, "bimage", avatarb, false, 'back silhouette image');
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

Basket.prototype.ItemToXML = function(orderNo, deliveryDate, base64array)
{
	var root = $.parseXML('<order></order>');
	var itemObj = this.curItem;
	var typeObj = this.curType;
	var colorObj = this.curColor;
	var sizeObj = this.curSize;
	var mata = this.curMatashita;
	var parts_specs = this.partsarray;
	// 注文日
	var today = new Date();
	var dayOfMonth = today.getDate();
	var order_date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + dayOfMonth;
	// 納期
	var custom_give_date = deliveryDate;
	if (custom_give_date == null) {
		today.setDate(dayOfMonth + 14);
		custom_give_date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
	}

	// 暫定値 ナビ共通
	var shopid = '0';
	var test_card_flag = false;
	var user_name1 = null;
	var user_name2 = null;
	var express_flag = 0;
	var custom_flag = 0;

	// ベースカラーイメージ
	var color_image = base64array[0].data;

	// avatar_front(back)の取得用const
	const MIMEtype = 'image/jpeg';
	const URIhead = 'data:' + MIMEtype;

	var orderXML = $(root).find('order')[0];

	if (orderNo.substr(0, 2) == 'PN')
		return DenimNaviItemToXML(orderNo, base64array);
	else
		return MashNaviItemToXML(orderNo);

	function DenimNaviItemToXML(orderNo, base64array)
	{
		// 暫定値　デニムナビ固有
		var total_amount = sizeObj['-price']; // オプション価格の上乗せが必要
		var tax_rate = 0.08;
		var nbs_code = 'xxxxxxx';
		var nbs_size_code = 'XX';
		var nbs_color_code = 'XX';
		var fabric_width = sizeObj['-width'];
		var fabric_height = sizeObj['-height'];
		var base_file_name = null;

		// avatar_front(back)の取得
		var dataurl;
		// avatar_front
		dataurl = document.getElementById('front').toDataURL(MIMEtype);
		if (dataurl.indexOf(URIhead) < 0)
		{
			alert('このブラウザではjpegデータに変換できません');
			return;
		}
		var avatar_front = dataurl.replace(URIhead + ';base64,', '');
		// avatar_back
		dataurl = document.getElementById('back').toDataURL(MIMEtype);
		var avatar_back = dataurl.replace(URIhead + ';base64,', '');

		// order_no
		insertTextElement(orderXML, 'order_no', orderNo);
		// order_date
		insertTextElement(orderXML, 'order_date', order_date);
		// shopid
		insertTextElement(orderXML, 'shopid', shopid);
		// test_card_flag
		insertTextElement(orderXML, 'test_card_flag', test_card_flag);
		// user_name1
		insertTextElement(orderXML, 'user_name1', user_name1);
		// user_name2
		insertTextElement(orderXML, 'user_name2', user_name2);
		// total_amount
		insertTextElement(orderXML, 'total_amount', total_amount);
		// total_tax
		var total_tax = total_amount * tax_rate;
		insertTextElement(orderXML, 'total_tax', total_tax);
		// avatar_front
		insertTextElement(orderXML, 'avatar_front', avatar_front);
		// avatar_back
		insertTextElement(orderXML, 'avatar_back', avatar_back);
		// custom_give_date
		insertTextElement(orderXML, 'custom_give_date', custom_give_date);
		// express_flag
		insertTextElement(orderXML, 'express_flag', express_flag);
		// express_flag
		insertTextElement(orderXML, 'custom_flag', custom_flag);
		// <order_bill> 開始
		var order_bill = insertElement(orderXML, 'order_bill');
		// <item_number></item_number>
		insertTextElement(order_bill, 'item_number', itemObj['-code']);
		// <item_code></item_code>
		insertTextElement(order_bill, 'item_code', nbs_code + '-' + nbs_size_code + '-' + nbs_color_code);
		// <item_type></item_type>
		insertTextElement(order_bill, 'item_type', itemObj['-silhouette']);
		// <item_type_name></item_type_name>
		insertTextElement(order_bill, 'item_type_name', itemObj['-name']);
		// <spec>1</spec>
		insertTextElement(order_bill, 'spec', itemObj['-spec']);
		// <detail></detail>
		insertTextElement(order_bill, 'detail', typeObj['-code']);
		// <detail_name></detail_name>
		insertTextElement(order_bill, 'detail_name', typeObj['-name']);
		// <fabric_code></fabric_code>
		insertTextElement(order_bill, 'fabric_code', itemObj.Fablic['-code']);
		// <fabric_width></fabric_width>
		insertTextElement(order_bill, 'fabric_width', fabric_width);
		// <fabric_height></fabric_height>
		insertTextElement(order_bill, 'fabric_height', fabric_height);
		// <item_image_front></item_image_front>
		insertTextElement(order_bill,'item_image_front', avatar_front);
		// <item_image_back></item_image_back>
		insertTextElement(order_bill,'item_image_back', avatar_back);
		// <size_text></size_text>
		insertTextElement(order_bill, 'size_text', sizeObj['-code']);
		// <under_crotch>70</under_crotch>
		if (mata !=null && Number(mata) > 0)
			insertTextElement(order_bill, 'under_crotch', mata);
		// <unit_price></unit_price>
		insertTextElement(order_bill, 'unit_price', total_amount);
		// <tax></tax>
		insertTextElement(order_bill, 'tax', total_tax);
		// <order_quantity></order_quantity>
		insertTextElement(order_bill, 'order_quantity', '1');
		// <thight_size/>
		// <waist_size/>
		// <hip_size/>
		// <body_height/>
		// <order_options> 開始
		var option_number = 1;
		var order_options = insertElement(order_bill, 'order_options');

		// ベースカラー <item> 開始
		var item = insertElement(order_options, 'item');
	        // <order_option> 開始
 		var order_option = insertElement(item, 'order_option');
		// <option_number></option_number>
		insertTextElement(order_option, 'option_number', option_number++);
		// <layered_order>/layered_order>
		insertTextElement(order_option, 'layered_order', '0');
		// <design_type></design_type>
		insertTextElement(order_option, 'design_type', 'n');
		// <sew_flag></sew_flag>
		insertTextElement(order_option, 'sew_flag', 'false');
		// <layout_flag></layout_flag>
		insertTextElement(order_option, 'layout_flag', 'true');
		// <line_stone_flag></line_stone_flag>
		insertTextElement(order_option, 'line_stone_flag', 'false');
		// <option_type/>
		insertTextElement(order_option, 'option_type', null);
		// <option_type_name></option_type_name>
		insertTextElement(order_option, 'option_type_name', 'ベースカラー');
		// <option_inner_number></option_inner_number>
		var base_inner_number = +colorObj['-code']; // 文字列->整数に型変換したものと同じ 今まで例外なし
		insertTextElement(order_option, 'option_inner_number', base_inner_number);
		// <option_name></option_name>
		insertTextElement(order_option, 'option_name', colorObj['-name']);
		// <option_file_name>PNB37B-A-2</option_file_name>
		insertTextElement(order_option, 'option_file_name', base_file_name);	// 修正要
		// <option_layer_name></option_layer_name>
		insertTextElement(order_option, 'option_layer_name', colorObj['-code']);
		// <option_swatch>Z-03</option_swatch>
		var basecolor_swatch = typeObj['-swatchhigh'];
		if (basecolor_swatch != null) {
			var swatchlow = colorObj['-swatchlow'];
			if (swatchlow != null)
				basecolor_swatch += swatchlow;
			else
				basecolor_swatch += colorObj['-code'];
		}
		insertTextElement(order_option, 'option_swatch', basecolor_swatch);
		// <print_pos_x></print_pos_x>
		insertTextElement(order_option, 'print_pos_x', '0');
		// <print_pos_y></print_pos_y>
		insertTextElement(order_option, 'print_pos_y', '0');
		// <unit_price></unit_price>
		insertTextElement(order_option, 'unit_price', total_amount);
		// <tax></tax>
		insertTextElement(order_option, 'tax', total_tax);
		// <order_quantity></order_quantity>
		insertTextElement(order_option, 'order_quantity', '0');
		// <option_image>
		insertTextElement(order_option, 'option_image', color_image);
		// </order_option> 終了
		// </item> ベースカラー 終了
		var plen = parts_specs.length;
		var layobj;
		for (var i = 0; i < plen; i++)
		{
			layobj = parts_specs[i];
			if (layobj.partsCode == null)
				continue;
			// 暫定値
			var layered_order = 1;
			var design_type = 'n';
			var sew_flag = false;
			var layout_flag = true;
			var linestone_flag = false;
			var print_pos_x = 0;
			var print_pos_y = 0;
			var option_inner_number = 1;	// 根拠のないダミー設定
			var option_file_name = null;

			switch (layobj.opt)
			{
				case 'DC6':
					layered_order = 1;
					break;
				case 'DC3':
					layered_order = 2;
					break;
				case 'DC1':
					layered_order = 3;
					break;
				case 'DC4':
					layered_order = 4;
					print_pos_y = '<div><mul><add><switch id="sitem" vals="13:0/14:32/15:0/16:0/17:32/18:0"/><mul><sub><var id="ucrotch"/><const val="83"/></sub><const val="10"/></mul></add><const val="180"/></mul><const val="25.4"/></div>';
					break;
				case 'IN1':
					layered_order = 5;
					break;
				case 'IN2':
					layered_order = 5;
					break;
				case 'STC':
					layered_order = 5;
					design_type = null;
					sew_flag = true;
					layout_flag = false;
					break;
				case 'LNS':
					layered_order = 6;
					design_type = null;
					linestone_flag = true;
					sew_flag = true;
					layout_flag = false;
					break;
				case 'BTN':
					layered_order = 7;
					design_type = null;
					sew_flag = true;
					layout_flag = false;
				case 'URA':
					layered_order = 8;
					design_type = 'j';
					layout_flag = false;
					break;
				case 'DC5':
					layered_order = 9;
					break;
			}
			// 各オプション <item> 開始
			item = insertElement(order_options, 'item');
	        	// <order_option> 開始
 			order_option = insertElement(item, 'order_option');
			// <option_number></option_number>
			insertTextElement(order_option, 'option_number', option_number++);
			// <layered_order>/layered_order>
			insertTextElement(order_option, 'layered_order', layered_order);
			// <design_type></design_type>
			insertTextElement(order_option, 'design_type', design_type);
			// <sew_flag></sew_flag>
			insertTextElement(order_option, 'sew_flag', sew_flag);
			// <layout_flag></layout_flag>
			insertTextElement(order_option, 'layout_flag', layout_flag);
			// <line_stone_flag></line_stone_flag>
			insertTextElement(order_option, 'line_stone_flag', linestone_flag);
			// <option_type/>
			var optstr = layobj.opt;
			insertTextElement(order_option, 'option_type', optstr);
			// <option_type_name></option_type_name>
			insertTextElement(order_option, 'option_type_name', layobj.optname);
			// <option_inner_number>3</option_inner_number>
			insertTextElement(order_option, 'option_inner_number', option_inner_number);
			// <option_name></option_name>
			insertTextElement(order_option, 'option_name', layobj.partsObj['-name']);
			if (layout_flag) {
				// <option_file_name>PNB37B-A-2</option_file_name>
				insertTextElement(order_option, 'option_file_name', option_file_name);
			}
			// <option_layer_name></option_layer_name>
			insertTextElement(order_option, 'option_layer_name', layobj.partsCode);
			// <option_swatch></option_swatch>
			insertTextElement(order_option, 'option_swatch', layobj.partsObj['-swatch']);
			// <print_pos_x></print_pos_x>
			insertTextElement(order_option, 'print_pos_x', print_pos_x);
			// <print_pos_y></print_pos_y>
			insertTextElement(order_option, 'print_pos_y', print_pos_y);
			// <unit_price></unit_price>
			var unit_price = layobj.partsObj['-tanka'];
			insertTextElement(order_option, 'unit_price', unit_price);
			// <tax></tax>
			insertTextElement(order_option, 'tax', unit_price * tax_rate);
			// <order_quantity></order_quantity>
			insertTextElement(order_option, 'order_quantity', '1');
			// <option_image>
			insertTextElement(order_option, 'option_image', base64array[i + 1].data);
		}

		// <order_options> 終了

		return orderXML;
	}

	function MashNaviItemToXML(orderNo, base64array)
	{
		// 暫定値　マッシュナビ固有
		var total_amount = sizeObj['-price'];　// 柄毎に変わる可能性あり
		var tax_rate = 0.08;
		var nbs_code = 'xxxxxxx';
		var nbs_size_code = 'XX';
		var nbs_color_code = 'XX';
		var fabric_width = sizeObj['-width'];	// 柄毎に変わる可能性あり
		var fabric_height = sizeObj['-height'];	// 柄毎に変わる可能性あり

		// avatar_front(back)の取得
		var dataurl;
		// avatar_front
		dataurl = document.getElementById('front').toDataURL(MIMEtype);
		if (dataurl.indexOf(URIhead) < 0)
		{
			alert('このブラウザではjpegデータに変換できません');
			return;
		}
		var avatar_front = dataurl.replace(URIhead + ';base64,', '');
		// avatar_back
		dataurl = document.getElementById('back').toDataURL(MIMEtype);
		var avatar_back = dataurl.replace(URIhead + ';base64,', '');

		// order_no
		insertTextElement(orderXML, 'order_no', orderNo);
		// order_date
		insertTextElement(orderXML, 'order_date', order_date);
		// shopid
		insertTextElement(orderXML, 'shopid', shopid);
		// test_card_flag
		insertTextElement(orderXML, 'test_card_flag', test_card_flag);
		// user_name1
		insertTextElement(orderXML, 'user_name1', user_name1);
		// user_name2
		insertTextElement(orderXML, 'user_name2', user_name2);
		// total_amount
		insertTextElement(orderXML, 'total_amount', total_amount);
		// total_tax
		var total_tax = total_amount * tax_rate;
		insertTextElement(orderXML, 'total_tax', total_tax);
		// avatar_front
		insertTextElement(orderXML, 'avatar_front', avatar_front);
		// avatar_back
		insertTextElement(orderXML, 'avatar_back', avatar_back);
		// custom_give_date
		insertTextElement(orderXML, 'custom_give_date', custom_give_date);
		// express_flag
		insertTextElement(orderXML, 'express_flag', express_flag);
		// express_flag
		insertTextElement(orderXML, 'custom_flag', custom_flag);

		// <order_bill> 開始
		var order_bill = insertElement(orderXML, 'order_bill');
		// <item_number></item_number>
		insertTextElement(order_bill, 'item_number', itemObj['-code']);
		// <item_name></item_name>
		insertTextElement(order_bill, 'item_name', itemObj['-name']);
		// <item_type /> mashnaviでは設定しない？
		insertTextElement(order_bill, 'item_type', null);
		// <item_type_name></item_type_name>
		insertTextElement(order_bill, 'item_type_name', typeObj['-name']);
		// <detail /> mashnaviでは設定しない？
		insertTextElement(order_bill, 'detail', null);
		// <detail_name></detail_name>
		insertTextElement(order_bill, 'detail_name', colorObj['-code']);
		// <nbs_code></nbs_code>
		insertTextElement(order_bill, 'nbs_code', nbs_code);
		// <nbs_size_code></nbs_size_code>
		insertTextElement(order_bill, 'nbs_size_code', nbs_size_code);
		// <nbs_color_code></nbs_color_code>
		insertTextElement(order_bill, 'nbs_color_code',	nbs_color_code);
		// <fabric_code></fabric_code>
		insertTextElement(order_bill, 'fabric_code', itemObj.Fablic['-code']);
		// <fabric_width></fabric_width>
		insertTextElement(order_bill, 'fabric_width', fabric_width);
		// <fabric_height></fabric_height>
		insertTextElement(order_bill, 'fabric_height', fabric_height);
		// <item_image_front></item_image_front>
		insertTextElement(order_bill,'item_image_front', avatar_front);
		// <item_image_back></item_image_back>
		insertTextElement(order_bill, 'item_image_back', avatar_back);
		// <size_text></size_text>
		insertTextElement(order_bill, 'size_text', sizeObj['-code']);
		// <unit_price></unit_price>
		insertTextElement(order_bill, 'unit_price', total_amount);
		// <tax></tax>
		insertTextElement(order_bill, 'tax', total_tax);
		// <order_quantity>1</order_quantity>
		insertTextElement(order_bill, 'order_quantity', '1');
		// <order_options> 開始
		var order_options = insertElement(order_bill, 'order_options');
		// <item> 開始
		var item = insertElement(order_options, 'item');
	        // <order_option> 開始
		var order_option = insertElement(item, 'order_option');
		// <option_number>1</option_number>
		insertTextElement(order_option, 'option_number', '1');
		// <layout_flag>true</layout_flag>
		insertTextElement(order_option, 'layout_flag', 'true');
		// <layered_order>0</layered_order>
		insertTextElement(order_option, 'layered_order', '0');
		// <design_code></design_code>
		insertTextElement(order_option, 'design_code', typeObj['-code']);
		// <design_name></design_name>
		insertTextElement(order_option, 'design_name', typeObj['-name']);
		// <option_swatch></option_swatch>
		insertTextElement(order_option, 'option_swatch', colorObj['-code']);
		// <option_name></option_name>
		insertTextElement(order_option, 'option_name', colorObj['-name']);
		// <order_quantity/> mashnaviでは未設定？
		insertTextElement(order_option, 'order_quantity', null);
		// <option_image>
		insertTextElement(order_option, 'option_image', color_image);
		// <unit_price></unit_price>
		insertTextElement(order_option, 'unit_price', total_amount);
		// <tax></tax>
		insertTextElement(order_option, 'tax', total_tax);
		// </order_option> 終了
		// </item> 終了
		// </order_options> 終了
		// <under_crotch></under_crotch>
		if (mata !=null && Number(mata) > 0)
			insertTextElement(order_bill, 'under_crotch', mata);
		// </order_bill> 終了
		// </order> 終了

		return orderXML;
	}

	function insertTextElement(xmlobj, name, value)
	{
		var elem = root.createElement(name);
		if (value != null)
			elem.appendChild(root.createTextNode(value));
		xmlobj.appendChild(elem);

		return elem;
	}
	function insertElement(xmlobj, name)
	{
		var elem = root.createElement(name);
		xmlobj.appendChild(elem);

		return elem;
	}
}
//
//	XML出力用にbase64データに変換し、完了後に指定関数を起動する
//
Basket.prototype.invokeAFunctionAfterGeneratingBase64data = function(mime, afunc)
{
	this.base64array = [];
	// ベースカラー
	this.base64array.push({file: this.curColor['-url'], done: false, data: null});
	var i;
	// パーツオプションを追加
	var buttonFolder =  this.curType['-buttonFolder']; // 'catalog/PNP00Z/';
	for (i = 0; i < this.partsarray.length; i++)
	{
		if (this.partsarray[i].partsCode != null) {
			var partsbutton = this.partsarray[i].button;
			this.base64array.push({file: buttonFolder + partsbutton, done: false, data: null});
		} else {
			this.base64array.push({done: true});
		}
	}
	// ベースカラーとオプションパーツイメージをbase64に変換
	for (i = 0; i < this.base64array.length; i++)
	{
		if (!this.base64array[i].done)
			convertAnImageFileOfArray(this.base64array, i, i > 0, mime, afunc);
	}

	function convertAnImageFileOfArray(imgarray, index, useAlt, mime, afunc)
	{
		var img = new Image();
		var flname = imgarray[index].file;
		imgarray[index].img = img;
		// img.crossOrigin = 'anonymous';
		img.colfile = flname;
		img.onload = function() {
			if (typeof(console) != 'undefined')
				console.log('button image loaded:' + this.colfile);
			if (this.wk_canvas == null) {
				this.wk_canvas = document.createElement('canvas');
			}
			this.wk_canvas.width = img.width;
			this.wk_canvas.height = img.height;
			// Copy the image contents to the canvas
			var ctx = this.wk_canvas.getContext('2d');
			ctx.drawImage(img, 0, 0, img.width, img.height);
			var dataurl = this.wk_canvas.toDataURL(mime);
			imgarray[index].data = dataurl.replace('data:' + mime + ';base64,', '');
			imgarray[index].done = true;
			imgarray[index].img = null;
			triggerFunc(imgarray, afunc);
		}
		img.onerror = function(evt) {
			if (useAlt) {
				var repstr = flname.replace(/\/PNP\d\d/, '/PNP00');
				if (repstr != flname) {
					imgarray[index].file = repstr;
					convertAnImageFileOfArray(imgarray, index, false, mime, afunc);
					return;
				}
			}
			alert('button image load error:' + this.colfile + errorToString(evt));
			imgarray[index].done = true;
			imgarray[index].img = null;
			// console.log(errorToString(evt.target));
			triggerFunc(imgarray, afunc);
		}
		img.src = flname;

		function triggerFunc(imgarray, afunc) {
			for (var i = 0; i < imgarray.length; i++) {
				if (!imgarray[i].done) {
					return;
				}
			}
			afunc(imgarray);
		}
	}
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
			layobj.partsObj = null;
			layobj.button = null;
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
			layobj.partsObj = partsobj;
			layobj.button = partsobj['-button'];
			layobj.front = partsobj['-front'];
			if (layobj.front != null &&
		    	    layobj.front != '')
			{
				var partsFile = partsFolder + layobj.front;
				loadAnImageFile(pbasket, layobj, "fimage", partsFile, true, 'parts image');

				if (Basket.onload_skipable && nimage.width > 0)
					immediateDraw = true;
			}

			layobj.back = partsobj['-back'];
			if (layobj.back != null &&
		    	    layobj.back != '')
			{
				var partsFile = partsFolder + layobj.back;
				loadAnImageFile(pbasket, layobj, "bimage", partsFile, true, 'parts image');
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


}

function errorToString(err)
{
	return ''; // JSON.stringify(err);
	var str = '';
	for (var key in err)
	{
		str += (':' + key /* + '=' + err[key] */);
	}
	return str; /* err.code + ':' + err.name + ':' + err.description*/
}

function alternatingFileLoad(pbasket, layobj, fbimage, partsFile, descr)
{
	var repstr = partsFile.replace(/\/PNP\d\d/, '/PNP00');
	if (repstr == partsFile)
		return null;
	loadAnImageFile(pbasket, layobj, fbimage, repstr, false, descr);
		return repstr;
}



function loadAnImageFile(pbasket, obj, imgname, flname, useAlt, descr)
{
	var img = obj[imgname] = document.createElement('Img'); // new Image();
	// img.crossOrigin = 'anonymous';
	img.colfile = flname;
	img.onload = function() {
		if (typeof(console) != 'undefined')
			console.log(descr + ' loaded:' + this.colfile);
		pbasket.redraw(true);
	}
	img.onerror = function(evt) {
		obj[imgname] = null;
		if (useAlt)
		{
			if (alternatingFileLoad(pbasket, obj, imgname, flname, descr) == null)
				pbasket.redraw(true);
		}
		else
			alert(descr + ' load error:' + this.colfile + errorToString(evt));
		// console.log(errorToString(evt.target));
		pbasket.redraw(true);
	}
	img.src = flname;
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
			loadAnImageFile(pbasket, pbasket.base, "fimage", color_f, false, 'base front image');
		}
		if (color_b != null && color_b != '')
		{
			loadAnImageFile(pbasket, pbasket.base, "bimage", color_b, false, 'base back image');
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
