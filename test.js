require.config({
	paths:{
		'bP': 'biPartite',
		'd3': 'd3'
	},
	shim: {
		'bP': ['d3']
	}
});
define(['bP'], function(){
	var lead_data = [];
	//数据格式
	// {
	// 	parent: [一级分类],
    //  child: {
	//  	key: [二级分类],
	//  	count: [对应的2级分类数量]
	//  }
	// }
	lead_data = buildTestData();
	function buildTestData(){
		var parent = ['通信社交', '网上购物', '图像影音', '新闻阅读', '交通出行','便捷生活','系统性能','金融理财','办公商务','手机美化','学习教育','健康医疗','育儿母婴'];
		var outer = {};
		var child = [];
		var count_child;
		var item_index;
		for(var index in parent) {
			var item_parent = parent[index];
			var random = Math.ceil(Math.random() * 30);
			
			var obj = {};

			var key = [];
			var count = [];
			for(var i = 1; i <= random; i++) {
				
				var count_child = Math.ceil(Math.random() * 100);
				var name = '分类'+(index * 13 + i);
				// var name = '分类'+i;
				key.push(name);
				count.push(count_child);
				
			}

			obj['key'] = key;
			obj['count'] = count;
			child.push(obj);

			
		}
		outer.parent = parent;
	    outer.child = child;
		return outer;
	}   
        var data = [{ data: lead_data, id: 'leads', header: ['一级分类', '二级分类', '二级分类比例图']}];

        bP.setOptions({
            // colors: ["#3366CC", "#DC3912", "#FF9900", "#109618", "#990099", "#0099C6"],
            colors: [
            "rgb(248,61,55)", 
            "rgb(70,155,253)", 
            "rgb(254,191,16)", 
            "rgb(147,214,36)", 
            "rgb(183,157,255)", 
            "rgb(11,88,162)",
            'rgb(16,103,188)',
            'rgb(23,117,205)',
            'rgb(31,149,217)',
            'rgb(40,164,231)',
            'rgb(66,203,253)',
            'rgb(110,219,255)',
            'rgb(153,230,255)'],

            // colors: ["#97C00E", "FFCC00", "#FF6464"],
            labelColumn: [-130, 90],
            valueColumn: [-50, 170], //(count (%)) first value is left position x, second value is right position x
            barpercentColumn: [-10, 220], //Column positions of labels.
            headerX: 375,
            headerY: -20,
            transitionWidth: 600,
            height: 600,
            duration: 600,
            sortbyKey: false,
            barlabelFontSize: "12",
            barValueFontSize: "10",
            barPercentFontSize: "10",
            width : 1100,
            height : 450,
            margin : { b: 0, t: 40, l: 170, r: 50 }
        });
        bP.draw(data,'body');
})