<!--

// グローバル

var itemArrayCache = null;	// Array of item objects
var typeArrayCache = null;	// Array of type objects corresponding to colorArrayCache
var colorArrayCache = null;	// Array of color objects
var sizeArrayCache = null;	// Array of size objects
var matashitaList = null;	// Array of matashita length
var matashitaDefault = -1;
var optArrayCache = null;	// Array of option objects
var curOptIndex = -1;
var partsArrayCache = null;	// Array of parts objects
 
function makeItemArray(root_node)
{
	return root_node.MashNavi.Item;
}

function getTemplateCollection(jsondata)
{
	return jsondata.MashNavi.TemplateCollection;
}

function makeColorArray(typelist)
{
	var children = typelist.Type;
	// alert('length2=' + children.length);
	colorarray = [];
	typeArrayCache = [];
	var count = 0;
	for (var i = 0; i < children.length; i++)
	{
		var leaves = children[i].detail
		for (var j = 0; j < leaves.length; j++)
		{
			colorarray.push(leaves[j]);
			typeArrayCache.push(children[i]);
		}
	}
	return colorarray;
}

function makeColorArrayFromTemplate(jsondata, templateId, typelist)
{
	if (templateId == null)
	{
		globalFullDesignTemplate = null;
		return makeColorArray(typelist);
	}
	if (templateId == globalFullDesignTemplate)
	{
		return colorArrayCache;
	} 
	globalFullDesignTemplate = templateId;

	var design; 	// alert(template + ' not found');
	var designlist = getTemplateCollection(jsondata).DesignTemplate;
	for (i = 0; i < designlist.length; i++)
	{
		if (designlist[i]['-id'] == templateId)
		{
			design = designlist[i];
			break;
		}
	}
	var curTypeL = null;
	if (design != null)
		curTypeL = design.TypeList;
	return makeColorArray(curTypeL);
}

function makeOptArrayFromTemplate(jsondata, templateId)
{
	if (templateId == globalPartsTemplate)
		return optArrayCache;
	globalPartsTemplate = templateId;
	if (!templateId)
	{
		return null;
	}

	var optslist = getTemplateCollection(jsondata).PartsTemplate;
	var optemp = null;
	if (Array.isArray(optlist))
	{
		for (var i = 0; i < optslist.length; i++)
		{
			if (optslist[i]['-id'] == templateId)
			{
				optemp = optslist[i];
				break;
			}
		}
	}
	else
	{
		if (optslist['-id'] == templateId)
			optemp = optslist;
	}
	if (optemp != null)
		return optemp.option;
	else
		return null;
}

function makePartsArray(optarray, optindex)
{
	// alert('displayartsList cur=' + curOptIndex + ' => ' + optIndex);
	if (optindex < 0)
		return null;
	if (optindex == curOptIndex)
		return partsArrayCache;
	var optObj = optarray[optindex];
	curOptIndex = optindex;
	return optObj.parts;
}

function makeSizeArray(itemObj)
{
	// alert('displayartsList cur=' + curOptIndex + ' => ' + optIndex);
	matashitaList = null;
	matshitaDefault = -1;
	var templateId = itemObj['-sizeTemplate'];
	//alert('templateId=' + templateId);
	var sizetemp = null;
	if (templateId != null)
	{
		var sizeList = getTemplateCollection(json_root).SizeTemplate;
		if (Array.isArray(sizeList))
		{
			for (i = 0; i < sizeList.length; i++)
			{
				if (sizeList[i]['-id'] == templateId)
				{
					sizetemp = sizeList[i];
					sizetemp = sizetemp.SizeList;
					break;
				}
			}
		}
		else if (sizeList['-id'] == templateId)
			sizetemp = sizeList.SizeList;
	}
	else
	{
		sizetemp = itemObj.Fablic.SizeList;
	}
	if (sizetemp == null)
		return null;
	//////sizetemp = sizetemp[0];
	//alert('sizetemp=' + sizetemp);
	var lengthMin = sizetemp['-lengthMin'];
	if (lengthMin != null)
	{
		matashitaList = [];
		var lengthMax = sizetemp['-lengthMax'];
		var lengthStep = sizetemp['-lengthStep'];
		var lengthInit = sizetemp['-lengthInit'];
		if (lengthInit != null)
			matashitaDefault = Number(lengthInit);
		//alert('length=' + lengthMin + ' ' + lengthMax + ' ' + lengthStep);
		if (lengthStep == null)
			lengthStep = 1;
		for (var i = Number(lengthMin); i <= Number(lengthMax); i += Number(lengthStep))
		{
			matashitaList.push(i);
		}
		//alert('matashitaList len=' + matashitaList.length);
	}
	return sizetemp.Size;
}
-->
