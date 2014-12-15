
// グローバル

var basket = null;
var json_root = null;

function handle_json(jsondata)
{
	// alert('handle_json');
	/**
	alert('requestFileSystem=' + typeof(window.requestFileSystem)
			+ ' webkitRequestFileSystem=' + typeof(window.webkitRequestFileSystem)
			+ ' MozRequestFileSystem=' + typeof(window.MozRequestFileSystem)
			+ ' MSRequestFileSystem=' + typeof(window.MSRequestFileSystem));
	**/
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
	canvas = document.getElementById('offline');
	context = canvas.getContext('2d');
	basket.set_offimage(canvas, context);
						
	hlist_item = document.getElementById('itemlist');
	hlist_color = document.getElementById('colorlist');
	hlist_size = document.getElementById('sizelist');
	hlist_matashita = document.getElementById('matashita');
	hlist_opt = document.getElementById('optlist');
	hlist_parts = document.getElementById('partslist');

	displayItemList(hlist_item, basket.getItemCache());
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
						console.log('書き込み完了');
					    };
					    fileWriter.onerror = function(e) {
						console.log('書き込みエラー: ' + e.toString());
					    };
					    fileWriter.write(blobData);
					  });
					}, function(e) {
						console.log('getfile エラー:' + e.message);
				        });
				      }, function (e) {
						console.log('getDirectory エラー:' + e.message);
				      });
				    }, function (e) {
					console.log('getDirectory エラー:' + e.message);
				    });
				}, function(e) {
					console.log('reqFileSystem エラー:' + e.message);
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

function jsonp_connect()
{
	alert('jsonp_connect() browser=' + navigator.appName + ' agent=' + navigator.userAgent + ' version=' + navigator.appVersion);

	fileSystemApiTest();

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

	itemIndexSelected = setSelected(hlist_item, itemIndexSelected, itemno);
	if (makeArray != null)
	{
		if (makeArray[0])
		{ 
			displayColorList(hlist_color, basket.getColorCache());
			colorIndexSelected = setSelected(hlist_color, colorIndexSelected, 0);
		}
		if (makeArray[1])
		{ 
			var optCache = basket.getOptCache();
			displayOptList(hlist_opt, optCache);
			var newOptIndex = (optCache == null || optCache.length == 0 ? -1 : 0);
			displayOptParts(newOptIndex);
		}
	}
	displaySizeList(hlist_size, basket.getSizeCache());
	// displayMatashitaList(hlist_matashita);
	displayMatashitaSlider(hlist_matashita);
}

function displayOptParts(newOptIndex)
{
	var jscache = basket.jscache;
	displayPartsList(hlist_parts, jscache.makePartsArray(newOptIndex));
	optIndexSelected = setSelected(hlist_opt, optIndexSelected, newOptIndex);
}

function chItemImg(opt)
{
	// alert('chItemImg alt=' + opt.alt);
	setItemNo(opt.alt);
}

function selectColorImage(colorIndex)
{
	basket.setColor(colorIndex >= 0 ? basket.getColorCache()[colorIndex][0] : null);
	colorIndexSelected = setSelected(hlist_color, colorIndexSelected, colorIndex);
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
	displayOptList(hlist_opt, optCache);
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
		jscache = basket.jscache;

		var prev = document.getElementById('prev');
 		selSize.style.zIndex = '3';
		itemObj = basket.getItem();
		var sizeArray = jscache.makeSizeArray(itemObj);
		displaySizeList(hlist_size, sizeArray);
		// displayMatashitaList(hlist_matashita);
		displayMatashitaSlider(hlist_matashita);
		prev.style.display = 'inline';

		var szdata = document.getElementById('SizeData');
		szdata.style.display = 'inline';
		var simu = document.getElementById('simulation');
		simu.style.display = 'none';
		return;
	}

	var no_get;
	var urlfile_noget = 'http://100.126.1.62/scripts/BottomsOrderno.aspx?navitype=PN&machineId=00';
	var urlfile = 'http://100.126.1.62/scripts/BottomsOrder.aspx';
	var use_gui_form = false; // true/false何れでもOK。blobを使用しておりそのためmultipart/form-dataが
				  // 自然に設定されると思われる。
	var upload_add = false;
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
		var order = data.getElementsByTagName('order');
		var orderno = order[0].getAttribute('orderNumber');
		if (!window.confirm('注文№は' + orderno + ' 注文しますか？'))
		{
			canceled = true;
			return;
		}

		no_get = false;
		var para_data = ['<waiwa del="yes" /waiwa>'];
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
		return $.ajax({
				url: urlfile,
				type: 'post',
				processData: false,
				contentType: false, // falseでなければならない。
						　　// このcontentTypenに直接 multipart/form-data; boundary=xxxxxxx
						    // を設定しようとしても設定したboundary要素を利用してくれない。
				// headers: {'Content-Type' : 'multipart/form-data; boundary=axbygd'}, // contentTypeと同様
				dataType: 'text',
				data: oMyForm
			});
	    })
	  .then(function(data, status) {
		if (!canceled)
			alert('upload応答=' + data);
	    })
	  .fail(function(jqXHR, status, errorThrown) {
		alert('エラー発生 no_get=' + no_get + ':' + status + ',' + jqXHR.responseText);
	    });
}

function selectSize(sizeIndex)
{
	// alert('size ' + sizeIndexSelected + ' -> ' + sizeIndex);
	basket.setSizeIndex(sizeIndex);
	sizeIndexSelected = setSelected(hlist_size, sizeIndexSelected, sizeIndex);
	// alert('sizeInexSelected=' + sizeIndexSelected);
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
	if (node.name == basket.jscache.getOptIndex())
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
	var jscache = basket.jscache;

	SelectPartsImage(jscache.getOptObject(-1)['-code'], jscache.partsArrayCache[opt.alt]['-code']);
	console.log('SelectPartsImage(' + jscache.getOptObject(-1)['-code'] + ',' + jscache.partsArrayCache[opt.alt]['-code'] + ')');
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
