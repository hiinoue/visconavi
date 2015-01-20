
// グローバル

var basket = null;
var json_root = null;
var current_page = 0;

const page_selspec = 0;
const page_selway = 1;
const page_selsize = 2;
const max_page = 4;

const display_default = 'inline-block';

var item_box;
var color_box;
var size_box;
var opt_box;
var parts_box;
var matashita_box;


var specarray = [{description: ['ゴルフパンツ', 'メンズ'], config: 'js/MashNaviItem_golf.js', img: 'catalog/Thumbnail/golf.png'}, 
		 {description: ['デニムナビ', 'レディースフラット'], config: 'js/MashNaviItem_mobile.jsonp'}
		];

var deliveryDate;

function select_spec()
{
	setPage(current_page);
	deliveryDate = null;
	// alert('select_spec() browser=' + navigator.appName + ' agent=' + navigator.userAgent + ' version=' + navigator.appVersion);

	// mobile safariでdraggableやsliderを使用可能にする
	// https://github.com/furf/jquery-ui-touch-punch
	var mobileSafari = /webkit.*mobile/i.test(navigator.userAgent)
	if (mobileSafari) {
  		$.getScript('js/jquery.ui.touch-punch.min.js');
	}

	fileSystemApiTest();
	// alert('canvas.toDataURL=' + document.createElement('canvas').toDataURL('image/jpeg').indexOf('data:image/jpeg'));

	var spec_box = new DisplayBox(document.getElementById('speclist'));
	displaySpecList(spec_box, specarray);

	var today = new Date();
	var orderdate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
	var timestamp = today.getTime();
	var urlfile_dateget = 'http://www.customOrder.jp/CreateDeliveryDate.action?orderDate=' + orderdate + '&timestamp=' + timestamp;
	console.log('urlfile_dateget=' + urlfile_dateget);
	$.ajax({
		url: urlfile_dateget,
		type: 'get',
		dataType: 'xml'
		})
	  .then(function(data, status) {
		//alert('ok');
		/* var order = data.getElementsByTagName('Order');
		replyDate = order[0].getAttribute('deliveryDate'); */
		var replyDate = data.documentElement.getAttribute('deliveryDate');
		deliveryDate = replyDate.replace(/\//g, '-'); // 年月日の区切りを/から-に替える
		// alert('納期=' + deliveryDate);
	    })
	  .fail(function(jqXHR, status, errorThrown) {
		alert('エラー発生 status=' + status + ',' + jqXHR.responseText + ':' + errorThrown);
	    });

	/**
	var jsonfile = 'catalog/MashNaviItem_mobile.js';
	jsonp_connect(jsonfile);
	**/
}

function chSpecImg(node)
{
	var jsonfile = specarray[Number(node.name)].config;
	setPage(page_selway);
	jsonp_connect(jsonfile);
}


function handle_json(jsondata)
{
	// alert('handle_json');
	/**
	alert('requestFileSystem=' + typeof(window.requestFileSystem)
			+ ' webkitRequestFileSystem=' + typeof(window.webkitRequestFileSystem)
			+ ' MozRequestFileSystem=' + typeof(window.MozRequestFileSystem)
			+ ' MSRequestFileSystem=' + typeof(window.MSRequestFileSystem));
	**/
	// alert("jsondata=" + jsondata.toSource());
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
	if (basket != null)
		basket.clear();
	basket = new Basket(jsondata);
	// basket.jsonroot = jsondata;
	var canvas = document.getElementById('front');
	var context = canvas.getContext('2d');
	basket.set_canvas_front(canvas, context);
	//オンライン描画コンテキストの取得
	canvas = document.getElementById('back');
	context = canvas.getContext('2d');
	basket.set_canvas_back(canvas, context);
	//alert('canvas_back=' + basket.get_canvas_back());
	//オフライン描画コンテキストの取得
	/* canvas = document.getElementById('offline');
	context = canvas.getContext('2d');
	basket.set_offimage(canvas, context);*/

	var dlist_item = document.getElementById('itemlist');
	var dlist_color = document.getElementById('colorlist');
	var dlist_size = document.getElementById('sizelist');
	var dlist_matashita = document.getElementById('matashita');
	var dlist_opt = document.getElementById('optlist');
	var dlist_parts = document.getElementById('partslist');

	item_box = new DisplayBox(dlist_item, 1);
	color_box = new DisplayBox(dlist_color, 4);
	size_box = new DisplayBox(dlist_size, 6);
	opt_box = new DisplayBox(dlist_opt, 1);
	parts_box = new DisplayBox(dlist_parts, 1);
	matashita_box = new DisplayBox(dlist_matashita);

	displayItemList(item_box, basket.getItemCache());
}

//
//	FileSystem APIを実装しているchromeでのダウンロードテスト
//
function fileSystemApiTest()
{
	var reqFileSystem = window.requestFileSystem || window.webkitRequestFileSystem
				 || window.MozRequestFileSystem || window.MSRequestFileSystem;
	var blobData;
	if (typeof(reqFileSystem) != 'undefined')
	{
		var download_site = 'http://localhost/mashnavi/';
				// 'http://www.ne.jp/asahi/inocchichichi/entrance/apps/';
		var download_name = 'catalog/PNP11A/BSE010.jpg';
		var download_file = download_site + download_name;
		alert('download file=' + download_file);
		var xhr = jQuery.ajaxSettings.xhr();
		xhr.open('GET', download_file, true);
		xhr.responseType = 'blob';
		var tid = setTimeout(function () {
				if (xhr.readyState != 4) {
					// 完了していなければ打ち切る
					xhr.abort();
					// error(xhr, 0);
				}
			}, 15 * 1000);
		xhr.onload = function () {
			alert('success:download ' + download_file + ' status:' + this.status);
			if (this.status == 200) {c
				clearTimeout(tid);
				blobData = this.response;
				navigator.webkitPersistentStorage.requestQuota(blobData.size, function(bytes) {
				  reqFileSystem(window.PERSISTENT, bytes, function(fs) {
				    fs.root.getDirectory('catalog', {create: true, exclusive: false}, function(dirEntry) {
				      dirEntry.getDirectory('PNP11B', {create: true, exclusive: false}, function(dirEntry) {
					dirEntry.getFile('BSE010.jpg' /* download_name */, {create: true, exclusive: false}, function(fileEntry) {
					  fileEntry.createWriter(function(fileWriter) {
					    fileWriter.onwriteend = function(e) {
						if (typeof(console) != 'undefined')
							console.log('書き込み完了');
					    };
					    fileWriter.onerror = function(e) {
						alert('書き込みエラー: ' + e.toString());
					    };
					    fileWriter.write(blobData);
					  });
					}, function(e) {
						alert('getfile エラー:' + e.message);
				        });
				      }, function (e) {
						alert('getDirectory エラー:' + e.message);
				      });
				    }, function (e) {
					alert('getDirectory エラー:' + e.message);
				    });
				}, function(e) {
					alert('reqFileSystem エラー:' + e.message);
				  });
				});
			}
			else
				error(this, this.status);
		};
		xhr.onerror = function () {
			alert('error:download ' + download_file);
			error(this, this.status);
		};
		xhr.send();
	}
}

function jsonp_connect(jsonfile)
{
	var local = true;
	var via_script = true;
	// alert('jsonp_connect local=' + local + ' via_script=' + via_script);
	//オンライン描画コンテキストの取得
	// cacheprogress.addEvent( window, 'load', cacheprogress.initialize );

	if (!local)
		jsonfile = 'http://192.168.0.128/mashnavi/' + jsonfile;

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
			error: function () {alert('jsonpファイル ロード失敗');}, 
			success: function(json_return)
			{
				handle_json(json_return);
			}
		});
	}
}

function setItemNo(itemno)
{
	var makeArray = basket.setItemNo(itemno);

	item_box.setSelected(itemno);
	if (makeArray != null)
	{
		if (makeArray[0])
		{ 
			displayColorList(color_box, basket.getColorCache());
			color_box.setSelected(0);
		}
		if (makeArray[1])
		{ 
			var optCache = basket.getOptCache();
			displayOptList(opt_box, optCache);
			var newOptIndex = (optCache == null || optCache.length == 0 ? -1 : 0);
			displayOptParts(newOptIndex);
		}
	}
	displaySizeList(size_box, basket.getSizeCache());
	// displayMatashitaList(hlist_matashita);
	displayMatashitaSlider(matashita_box);
	displayMatashitaScale(document.getElementById('matashitaScale'));
}

function displayOptParts(newOptIndex)
{
	var jscache = basket.jscache;
	displayPartsList(parts_box, jscache.makePartsArray(newOptIndex));
	opt_box.setSelected(opt_box, newOptIndex);
}

function chItemImg(opt)
{
	// alert('chItemImg alt=' + opt.alt);
	setItemNo(opt.alt);
}

function selectColorImage(colorIndex)
{
	basket.setColor(colorIndex >= 0 ? basket.getColorCache()[colorIndex][0] : null);
	color_box.setSelected(colorIndex);
}
function chColImg(opt)
{
	selectColorImage(opt.alt);
}
function handleOpts(event)
{
	var optCache = basket.getOptCache();
	if (optCache == null ||
	    optCache.length == 0)
		return;
 	document.getElementById('opttab').style.visibility = 'visible';
	document.getElementById('partstab').style.visibility = 'visible';
	displayOptList(opt_box, optCache);
	newIndex = 0;
	displayOptParts(newIndex);
}

function setPage(page)
{
	current_page = page;
	var selSpec = document.getElementById('selectSpec');
	var selSize = document.getElementById('selectSize');
	var simu = document.getElementById('simulation');
	var waydiv = document.getElementById('waydiv');
	var opttab = document.getElementById('opttab');
	var partstab = document.getElementById('partstab');
	var szdata = document.getElementById('SizeData');
	var prev = document.getElementById('prev');
	var next = document.getElementById('next');
	switch (page)
	{
		case 0:
			prev.style.display = 'none';
			next.style.display = 'none';
			selSpec.style.display = display_default;
			simu.style.display = 'none';
			szdata.style.display = 'none';
			break;
		case 1:
			prev.style.display = display_default;
			next.style.display = display_default;
			selSpec.style.display = 'none';
			setAvatar('big', 'small');
			simu.style.display = display_default;
			waydiv.style.display = display_default;
			opttab.style.display = 
			partstab.style.display =
			szdata.style.display = 'none';
			break;
		case 2:
			prev.style.display = display_default;
			next.style.display = display_default;
			selSpec.style.display = 'none';
			setAvatar('big', 'small');
			simu.style.display = display_default;
			waydiv.style.display = 'none';
			opttab.style.display = 
			partstab.style.display = display_default;
			szdata.style.display = 'none';
			break;
		case 3:
			prev.style.display = display_default;
			next.style.display = display_default;
			selSpec.style.display = 'none';
			setAvatar('medium', 'medium');
			simu.style.display = display_default;
			waydiv.style.display = 
			opttab.style.display = 
			partstab.style.display = 'none';
			szdata.style.display = display_default;
			break;
		case 4:
			prev.style.display = display_default;
			next.style.display = 'none';
			selSpec.style.display = 'none';
			simu.style.display = 'none';
			szdata.style.display = display_default;
			break;
	}
}

var	divwidth;
var	minwidth;
var	divheight;
var	minheight;
function setAvatar(fstyle, bstyle)
{
	if (divwidth == null ||
	    divheight == null) {
		var front_back = document.getElementById('front_back');
		var sstyle = front_back.currentStyle || document.defaultView.getComputedStyle(front_back, '')
		if (divheight == null) {
			divheight = sstyle.height.replace('px', '');
			minheight = divheight / 4;
		}
		if (divwidth == null) {
			divwidth = sstyle.width.replace('px', '');;
			minwidth = divwidth / 4;
		}
	}
	var front = document.getElementById('front');
	var back = document.getElementById('back');
	switch (fstyle)
	{
		case 'big':
			front.style.top = '0px';
			front.style.left = '0px';
			front.style.height = divheight + 'px';
			front.style.zIndex = 1;
			break;
		case 'medium':
			front.style.left = '0px';
			front.style.top = (divheight / 4) + 'px';
			front.style.height = (divheight / 2) + 'px';
			front.style.zIndex = 1;
			break;
		case 'small':
		default:
			front.style.top = (divheight - minheight) + 'px';
			front.style.left = (divwidth - minwidth) + 'px';
			front.style.height = minheight + 'px';
			front.style.zIndex = 2;
			break;
	}
	switch (bstyle)
	{
		case 'big':
			back.style.top = '0px';
			back.style.left = '0px';
			back.style.height = divheight + 'px';
			back.style.zIndex = 1;
			break;
		case 'medium':
			back.style.left = (divwidth / 2) + 'px';
			back.style.top = (divheight / 4) + 'px';
			back.style.height = (divheight / 2) + 'px';
			back.style.zIndex = 1;
			break;
		case 'small':
		default:
			back.style.top = (divheight - minheight) + 'px';
			back.style.left = (divwidth - minwidth) + 'px';
			back.style.height = minheight + 'px';
			back.style.zIndex = 2;
			break;
	}
}

function viewFront() {
	setAvatar('big', 'small');
}
function viewBack() {
	setAvatar('small', 'big');
}

function prevPage(event)
{
	if (Number(current_page) <= 0)
		return;
	switch (current_page)
	{
		case 3:
			var optCache = basket.getOptCache();
			if (optCache == null ||
	    		    optCache.length == 0)
				current_page--;
		default:
			setPage(Number(current_page) - 1);
	}
}

function nextPage(event)
{
	if (Number(current_page) >= Number(max_page))
		return;
	switch (current_page)
	{
		case 1:
			var optCache = basket.getOptCache();
			if (optCache == null ||
	    		    optCache.length == 0)
				current_page++;
		default:
			setPage(Number(current_page) + 1);
	}
	if (Number(current_page) < Number(max_page))
		return;

	if (basket.curColor == null)
	{
		alert('アイテム・色柄未選択！！！');
		return;
	}
	if (basket.curSize == null)
	{
		alert('サイズ未入力！！！');
		return;
	}
	const local_test = false;
	var no_get;
	var navitype = (basket.curPartsTemplate != null ? 'PN' : 'MN');
	var urlfile_noget;
	var urlfile;
	if (local_test) { // ローカルサーバー
		urlfile_noget = 'http://192.168.0.128/scripts/BottomsOrderno.aspx';
		urlfile = 'http://192.168.0.128/scripts/BottomsOrder.aspx';
	} else if (navitype == 'PN') {
		urlfile_noget = 'http://www.customorder.jp/CreatePantsOrderNumber.action';
		urlfile = 'http://www.customOrder.jp/PantsOrderAccept_Upload.action';
	} else {
		urlfile_noget = 'http://www.customOrder.jp/CreateMashOrderNumber.action';
		urlfile = 'http://www.customOrder.jp/MashOrderAccept_Upload.action';
	}
	urlfile_noget += ('?navitype=' + navitype + '&machineId=0');
	var use_gui_form = false; // true/false何れでもOK。blobを使用しておりそのためmultipart/form-dataが
				  // 自然に設定されると思われる。
	var upload_add = (navitype == 'PN');
	var use_bbuilder = false;
	var canceled = false;
	var BBuilder;
	if (typeof(Blob) != typeof(Function))
	{
		BBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
		if (typeof(BBuilder) == 'undefined')
		{
			if (typeof(Blob) == 'undefined')
			{
				alert('Blob未実装のため処理不可');
				return;
			}
		}
		else
			use_bbuilder = true;
	}
	no_get = true;	// 最初に№を取得する
	$.ajax({
		url: urlfile_noget,
		type: 'get',
		dataType: 'xml'
		})
	  .then(function(data, status) {
		/*var order = data.getElementsByTagName('order');
		var orderelem;
		if (order.length > 0) {
			orderelem = order[0];*/
		var orderno = data.documentElement.getAttribute('orderNumber');
		if (!window.confirm('注文№は' + orderno + ' 注文しますか？'))
		{
			canceled = true;
			return;
		}

		basket.invokeAFunctionAfterGeneratingBase64data('image/png', function(base64dt) {
		 	var orderXML = basket.ItemToXML(orderno, deliveryDate, base64dt);
			var para_data = [(new XMLSerializer()).serializeToString(orderXML)];
			// console.log(para_data);
			var oMyForm;
			var oMyBlob;
			if (use_bbuilder)
			{
				var BBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
				var bb = new BBuilder();
				bb.append(para_data);
				oMyBlob = bb.getBlob('text/xml');
			}
			else
				oMyBlob = new Blob(para_data, {type : 'text/xml'}); // the blob
			if (use_gui_form)
			{
				$form = $('#upload-form');
       				oMyForm = new FormData($form[0]);
			}
			else
				oMyForm = new FormData();

			if (upload_add)
				oMyForm.append('FileName', orderno + '.xml');
			oMyForm.append('orderData', oMyBlob, orderno + '.xml');
			if (upload_add)
				oMyForm.append('Upload', 'Submit Query');
			$.ajax({
				url: urlfile,
				type: 'post',
				processData: false,
				contentType: false, // falseでなければならない。
						　　// このcontentTypenに直接 multipart/form-data; boundary=xxxxxxx
						    // を設定しようとしても設定したboundary要素を利用してくれない。
				// headers: {'Content-Type' : 'multipart/form-data; boundary=axbygd'}, // contentTypeと同様
				dataType: 'text',
				data: oMyForm
				})
		  	  .then(function(data, status) {
				alert('upload応答=' + data);
				setPage(0);
		    	    })
		  	  .fail(function(jqXHR, status, errorThrown) {
				alert('注文データ送信エラー:' + status + ',' + jqXHR.responseText);
		    	    });
		});
	    })
	  /****
	  .then(function(data, status) {
		if (!canceled)
			alert('upload応答=' + data);
		setPage(0);
	    })
	  ****/
	  .fail(function(jqXHR, status, errorThrown) {
		alert('注文№取得でエラー発生:' + status + ',' + jqXHR.responseText);
	    });
}

function selectSize(sizeIndex)
{
	// alert('size ' + sizeIndexSelected + ' -> ' + sizeIndex);
	basket.setSizeIndex(sizeIndex);
	size_box.setSelected(sizeIndex);
	// alert('sizeInexSelected=' + sizeIndexSelected);
}

function chSize(node)
{
	selectSize(node.name);
}

function chMatashita(node)
{
	//var selidx = hlist_matashita.selectedIndex;
	basket.setMatashita(matashita_box.domobj.value);
}

function minusMatashita()
{
	var sliderval = $('#matashita').slider('value');
	sliderval -= $('#matashita').slider('option', 'step');
	$('#matashita').slider('value', sliderval);
}
function plusMatashita()
{
	var sliderval = $('#matashita').slider('value');
	sliderval += $('#matashita').slider('option', 'step');
	$('#matashita').slider('value', sliderval);
}

function chOptImg(node)
{
	if (node.name == basket.jscache.getOptIndex())
		return;
	var newIndex = node.name;
	displayOptParts(newIndex);
}

function SelectPartsImage(opt, code)
{
	parts_box.setSelected(basket.SelectParts(opt, code));
}
function chPartsImg(opt)
{
	var jscache = basket.jscache;

	SelectPartsImage(jscache.getOptObject(-1)['-code'], jscache.partsArrayCache[opt.alt]['-code']);
	if (typeof(console) != 'undefined')
		console.log('SelectPartsImage(' + jscache.getOptObject(-1)['-code'] + ',' + jscache.partsArrayCache[opt.alt]['-code'] + ')');
}


function tableTouch(event)
{
	event.stopPropagation();
	var curTarget = event.currentTarget;
	var target = event.target;
	console.log('tableTouch type=' + event.type + ' current=(' + curTarget.tagName + ',' + curTarget.id + ') src=(' + target.tagName + ',' + target.id + ')');
	switch (curTarget.id) {
		case 'front_back':
		case 'waydiv':
		// case 'colorlist':
			event.preventDefault();
			break;
		default:
	}
	switch (curTarget.tagName.toLowerCase()) {
		case 'table':
		case 'TABLE':
			console.log('tableTouch preventDefault');
			event.preventDefault();
			break;
		default:
	}
	switch (event.target.tagName.toLowerCase()) {
		case 'div':
		case 'table':
		case 'DIV':
			console.log('tableTouch preventDefault 2');
			event.preventDefault();
			break;
		default:
	}
}

function bodyTouch(event)
{
	event.stopPropagation();
	var curTarget = event.currentTarget;
	var target = event.target;
	console.log('bodyTouch type=' + event.type + ' current=(' + curTarget.tagName + ',' + curTarget.id + ') src=(' + target.tagName + ',' + target.id + ')');
	switch (curTarget.tagName.toLowerCase()) {
		case 'body':
			if (target.tagName.toLowerCase() != 'button')
				event.preventDefault();
			break;
		default:
	}
	switch (target.tagName.toLowerCase()) {
		case 'body':
		case 'div':
			event.preventDefault();
			break;
		default:
	}
}

function bodyGesture(event)
{
	console.log('bodyGesture');
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
