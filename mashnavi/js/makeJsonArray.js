<!--

var NaviCacheHolder = function(json_root) {
// グローバル

	this.root_node = json_root;

	this.globalFullDesignTemplate = null; // String
	this.globalPartsTemplate = null; // String

	this.itemArrayCache = null;	// Array of item objects
	this.colorArrayCache = null;	// Array of color objects
	this.sizeArrayCache = null;	// Array of size objects
	this.matashitaArray = null;	// Array of matashita length
	this.matashitaDefault = -1;
	this.optArrayCache = null;	// Array of option objects
	this.curOptIndex = -1;
	this.partsArrayCache = null;	// Array of parts objects
 
	this.itemArrayCache = null;
	if (json_root != null)
		this.itemArrayCache = json_root.MashNavi.Item;
}

//
//	NaviCache class method
//
NaviCacheHolder.prototype.parentTypeOf = function(color)
{
	var type = null;
	for (var i = 0; i < this.colorArrayCache.length; i++)
	{
		if (color == this.colorArrayCache[i][0])
		{
			type = this.colorArrayCache[i][1];
			break;
		}
	}
	return type;	
}

NaviCacheHolder.prototype.getTemplateCollection = function()
{
	return this.root_node.MashNavi.TemplateCollection;
}

NaviCacheHolder.prototype.makePartsArray = function(optindex)
{
	var optarray = this.optArrayCache;
	// alert('this.makePartsArray cur=' + this.curOptIndex + ' => ' + optIndex);
	if (optindex < 0)
		return null;
	if (optindex == this.curOptIndex)
		return this.partsArrayCache;
	var optObj = optarray[optindex];
	this.curOptIndex = optindex;
	var partsarray;
	if (Array.isArray(optObj.parts))
		partsarray = optObj.parts;
	else
		partsarray = [optObj.parts];
	this.partsArrayCache = partsarray;
	return partsarray;
}

NaviCacheHolder.prototype.setItemNo = function(basket, itemno) {
	var newItem = (itemno >= 0 ? this.itemArrayCache[itemno] : null);
	if (newItem == basket.getItem())
		return null;
	var makeCXArray = false;
	var makeCArray = false;
	var makePXArray = false;
	// alert('chItemImg alt=' + opt.alt);
	var designtemp = newItem['-designTemplate'];
	var sub = newItem['-sub'];
	var siltemp = newItem['-silhouetteTemplate'];
	var partstemp = newItem['-partsTemplate'];

	if (designtemp == null ||
    	    designtemp != basket.getDesignTemplate())
		makeCXArray = makeCArray = true;
	else if (designtemp + sub != this.globalFullDesignTemplate)
		makeCXArray = true;
	if (partstemp != this.globalPartsTemplate)
		makePXArray = true;
	basket.setItem(newItem);
	if (makeCXArray)
		this.colorArrayCache = makeColorArrayFromTemplate(this, designtemp ? designtemp + sub : null, designtemp ? null : newItem.Fablic.TypeList);
	if (makeCArray)
	{ 
		var newColorIndex = 0;	// default動作
		basket.setColor(this.colorArrayCache[newColorIndex][0]);
	}
	if (makePXArray)
	{
		this.optArrayCache = makeOptArrayFromTemplate(this, partstemp);
		basket.makePartsArray(this.optArrayCache, partstemp);
	}
	this.sizeArrayCache = this.makeSizeArray(newItem);
	return [makeCArray, makePXArray];

	function makeColorArrayFromTemplate(pcache, templateId, typelist)
	{
		if (templateId == null)
		{
			pcache.globalFullDesignTemplate = null;
			return makeColorArray(typelist);
		}
		if (templateId == pcache.globalFullDesignTemplate)
		{
			return colorArrayCache;
		} 
		pcache.globalFullDesignTemplate = templateId;

		var design; 	// alert(template + ' not found');
		var designlist = pcache.getTemplateCollection().DesignTemplate;
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
	function makeColorArray(typelist)
	{
		var children = typelist.Type;
		// alert('length2=' + children.length);
		colorarray = [];
		var count = 0;
		for (var i = 0; i < children.length; i++)
		{
			var leaves = children[i].detail
			for (var j = 0; j < leaves.length; j++)
			{
				colorarray.push([leaves[j], children[i]]);
			}
		}
		return colorarray;
	}
	function makeOptArrayFromTemplate(pcache, templateId)
	{
		if (templateId == pcache.globalPartsTemplate)
			return pcache.optArrayCache;
		pcache.globalPartsTemplate = templateId;
		if (!templateId)
		{
			return null;
		}

		var optslist = pcache.getTemplateCollection().PartsTemplate;
		var optemp = null;
		if (Array.isArray(optslist))
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
}

NaviCacheHolder.prototype.getOptIndex = function() {
	return this.curOptIndex;
}

NaviCacheHolder.prototype.getOptObject = function(optIndex) {
	if (this.optArrayCache != null)
	{
		if (optIndex < 0)
		{
			if (this.curOptIndex >= 0)
				return this.optArrayCache[this.curOptIndex];
		}
		else if (optIndex < this.optArrayCache.length)
			return this.optArrayCache[optIndex];
	}
	return null;
}

NaviCacheHolder.prototype.makeSizeArray = function(itemObj)
{
	// alert('makeSizeArray');
	this.matashitaArray = null;
	this.matshitaDefault = -1;
	if (itemObj == null)
		return;
	var templateId = itemObj['-sizeTemplate'];
	//alert('templateId=' + templateId);
	var sizetemp = null;
	if (templateId != null)
	{
		var sizeList = this.getTemplateCollection().SizeTemplate;
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
		this.matashitaArray = [];
		var lengthMax = sizetemp['-lengthMax'];
		var lengthStep = sizetemp['-lengthStep'];
		var lengthInit = sizetemp['-lengthInit'];
		if (lengthInit != null)
			this.matashitaDefault = Number(lengthInit);
		//alert('length=' + lengthMin + ' ' + lengthMax + ' ' + lengthStep);
		if (lengthStep == null)
			lengthStep = 1;
		for (var i = Number(lengthMin); i <= Number(lengthMax); i += Number(lengthStep))
		{
			this.matashitaArray.push(i);
		}
		//alert('matashitaArray len=' + this.matashitaArray.length);
	}
	return sizetemp.Size;
}

-->
