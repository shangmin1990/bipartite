live instance http://shangmin1990.github.io/bipartite
---适用场景:
  两级分类，展示出第一级分类所占比例，选中某一级后展示其第二级分类所占比例
使用：（参考test.js）
  引入d3.js
  引入biPartite.js
  准备数据：
  var original_data = {
   parent: [一级分类],
   child: {
     key: [二级分类],
     count: [二级分类对应count]
   }
  };
  
  var data = [{
      data: bP.partData(original_data),
      id: 'idddd',
      'header': ['主header名称', 一级header名称, 二级header名称]
  }];
  
  bP.draw(data, 'containerSelection(元素id)')
