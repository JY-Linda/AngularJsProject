/**
 * Created by JY on 2016/9/29.
 * 试卷模块
 */
angular.module("app.paper",["ng","app.subject"])
    //列表(查询)控制器
    .controller("paperListController",["$scope",function($scope){

    }])
    //添加控制器
    .controller("paperAddController",["$scope","commonService","$routeParams","paperModel","paperService","$location",
        function($scope,commonService,$routeParams,paperModel,paperService,$location){
        commonService.getAllDepartmentes(function(data){
            //将全部方向绑定到作用域的departmentes中
           $scope.departmentes = data;
        });
        var subjectId = $routeParams.id;
        if(subjectId !=0 ){
            //将要添加题目的id添加到数组
            paperModel.addSubjectId(subjectId);
            //console.log($routeParams);
            paperModel.addSubject(angular.copy($routeParams));
        }
        $scope.pmodel = paperModel.model;
        $scope.savePaper = function(){
            paperService.savePaper($scope.pmodel,function(data){
                alert(data);
                $location.path("/PaperAdd/id/0/stem/0/type/0/topic/0/level/0");
            });
        }
            //paperModel.show();
}])//试卷删除控制器
    .controller("paperDelController",["$scope",function($scope){

}])
    .factory("paperService",["$httpParamSerializer","$http",
    function($httpParamSerializer,$http){
    return {
      savePaper:function(params,handler){
          var obj = {};
          for(var key in params){
              var val = params[key];
              switch(key){
                  case "departmentId":obj['paper.department.id	']=val;
                      break;
                  case "title":obj['paper.title']=val;
                      break;
                  case "desc":obj['paper.description']=val;
                      break;
                  case "total":obj['paper.totalPoints']=val;
                      break;
                  case "answerTime":obj['paper.answerQuestionTime']=val;
                      break;
                  case "scores":obj['scores']=val;
                      break;
                  case "subjectIds":obj['subjectIds']=val;
                      break;
              }
          }
          //对obj对象进行表单格式的序列化操作（默认json格式）
          obj = $httpParamSerializer(obj);
          $http.post("http://172.16.0.5:7777/test/exam/manager/saveExamPaper.action",obj,{
              //设置请求头
              headers:{
                  //设置表单数据编码格式
                  "Content-Type":"application/x-www-form-urlencoded"
              }
          }).success(function(data){
              handler(data);
          });
      }
    };
}])
    .factory("paperModel",function(){
        return {
            //模板， 单例
            model:{
                departmentId:1,//方向id
                title:"初一英语单元测试",//试卷标题
                desc:"",//试卷描述
                answerTime:0,//答题时间
                total:0,//总分
                scores:[],//每个题目分值
                subjectIds:[],//每个题目的id
                subjects:[]

            },
            // show:function(){
            //   console.log(this.model);
            // },
            addSubjectId:function(id){
                this.model.subjectIds.push(id);
            },
            addSubject:function(subject){
                this.model.subjects.push(subject);
            }
        };
    });
