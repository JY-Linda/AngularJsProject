/**
 * Created by lichunyu on 16/9/22.
 * 题目管理的js模块
 */
angular.module("app.subject",["ng"])
    .controller("subjectDelController",["$routeParams","subjectService","$location",
        function($routeParams,subjectService,$location){
        var flag = confirm("确认删除");
            if(flag){
                var id = $routeParams.id;
                subjectService.delSubject(id,function(data){
                    alert(data);
                    $location.path("/AllSubject/a/0/b/0/c/0/d/0");
                });
            }else{
                $location.path("/AllSubject/a/0/b/0/c/0/d/0");
            }
    }])
    .controller("subjectCheckController",["$routeParams","subjectService","$location",function($routeParams,subjectService,$location){
        subjectService.checkSubject($routeParams.id,$routeParams.state,function(data){
           alert(data);
            $location.path("/AllSubject/a/0/b/0/c/0/d/0");
        });
}])
    .controller("subjectController",["$scope","commonService","subjectService","$routeParams",
        "$location",function ($scope,commonService,subjectService,$routeParams,$location) {
            //获取所有题目类型,题目难度级别，题目所属部门，题目所属知识点
            commonService.getAllTypes(function (data) {
                $scope.types = data;
            });
            commonService.getAllLevels(function (data) {
                $scope.levels = data;
            });
            commonService.getAllDepartmentes(function (data) {
                $scope.departmentes = data;
            });
            commonService.getAllTopics(function (data) {
                $scope.topics = data;
            });
            //获取所有的题目信息
            subjectService.getAllSubjects($routeParams,function (data) {

                data.forEach(function (subject) {
                    var answer = [];
                    //为每个选项添加编号 A B C D
                    subject.choices.forEach(function (choice,index) {
                        choice.no = commonService.convertIndexToNo(index);
                    });
                    //当当前题目类型为单选或者多选的时候，修改subject  answer
                   if(subject.subjectType){
                        if(subject.subjectType.id != 3){
                            subject.choices.forEach(function (choice) {
                                if(choice.correct){
                                    answer.push(choice.no);
                                }
                            });
                            //修改当前题目的answer
                            subject.answer = answer.toString();
                        }
                   }
                });
                $scope.subjects = data;
            });
            //获取地址后面携带的参数
            $scope.params = $routeParams;
            $scope.subject = {
                typeId:1,
                levelId:1,
                departmentId:1,
                topicId:1,
                stem:'',
                answer:'',
                analysis:'',
                choiceContent:[],
                choiceCorrect:[false,false,false,false]
            };
            //保存并继续函数
            $scope.submit = function(){
                subjectService.saveSubject( $scope.subject,function(data){
                    alert(data);
                });
                //定义与作用域中相同的对象，用于重置作用域中表单默认值
                var  subject = {
                    typeId:1,
                    levelId:1,
                    departmentId:1,
                    topicId:1,
                    stem:'',
                    answer:'',
                    analysis:'',
                    choiceContent:[],
                    choiceCorrect:[false,false,false,false]
                };
                //重置作用域中绑定的表单默认值
                angular.copy(subject,$scope.subject);
            };
            //保存并关闭函数
            $scope.submitAndClose = function(){
                subjectService.saveSubject( $scope.subject,function(data){
                    alert(data);
                });
                //跳转到列表页面
                $location.path("/AllSubject/a/0/b/0/c/0/d/0");
            }
    }])
    .service("subjectService",["$http","$httpParamSerializer",function ($http,$httpParamSerializer) {
        //审核函数
        this.checkSubject = function(id,state,handler){
            $http.get("http://172.16.0.5:7777/test/exam/manager/checkSubject.action",{
                params:{
                    'subject.id':id,
                    'subject.checkState':state
                }
            }).success(function(data){
                handler(data);
            });
        };
        //删除数据函数
        this.delSubject = function(id,handler){
            $http.get("http://172.16.0.5:7777/test/exam/manager/delSubject.action",{
                params:{
                    'subject.id':id
                }
            }).success(function(data){
                handler(data);
            });
        }
        //保存添加数据函数
        this.saveSubject = function(params,handler){
            var obj = {};
            for(var key in params){
                var val = params[key];
                    switch(key){
                        case "typeId":obj['subject.subjectType.id']=val;
                            break;
                        case "levelId":obj['subject.subjectLevel.id']=val;
                            break;
                        case "departmentId":obj['subject.department.id']=val;
                            break;
                        case "topicId":obj['subject.topic.id']=val;
                            break;
                        case "stem":obj['subject.stem']=val;
                            break;
                        case "answer":obj['subject.answer']=val;
                            break;
                        case "analysis":obj['subject.analysis']=val;
                            break;
                        case "choiceContent":obj['choiceContent']=val;
                            break;
                        case "choiceCorrect":obj['choiceCorrect']=val;
                            break;
                    }
            }
            //对obj对象进行表单格式的序列化操作（默认json格式）
            obj = $httpParamSerializer(obj);
            $http.post("http://172.16.0.5:7777/test/exam/manager/saveSubject.action",obj,{
                headers:{
                    "Content-Type":"application/x-www-form-urlencoded"
                }
            }).success(function(data){
                handler(data);
            });
        };
        //请求全部题目函数
        this.getAllSubjects = function (params,handler) {
            var data = {};
            for(var key in params){
                var val = params[key];
                if(val!= 0){
                    switch(key){
                        case "a":data['subject.subjectType.id']=val;
                            break;
                        case "b":data['subject.subjectLevel.id']=val;
                            break;
                        case "c":data['subject.department.id']=val;
                            break;
                        case "d":data['subject.topic.id']=val;
                            break;
                    }
                }
            }
            $http.get("http://172.16.0.5:7777/test/exam/manager/getAllSubjects.action",{
                params:data
            }).success(function (data) {
            //$http.get("data/subjects.json").success(function (data) {
                handler(data);
            });
        };
    }])
    .factory("commonService",["$http",function ($http) {
        return {
            //通过index(0 1 2 3 )获取所对应的序号(A B C D)
            convertIndexToNo:function(index){
                return index==0?'A':(index==1?'B':(index==2?'C':(index==3?'D':'E')));
            },
            getAllTypes : function (handler) {
                //$http.get("data/types.json").success(function (data) {
                $http.get("http://172.16.0.5:7777/test/exam/manager/getAllSubjectType.action").success(function (data) {
                    handler(data);
                });
            },
            getAllLevels : function (handler) {
                //$http.get("data/levels.json").success(function (data) {
                $http.get("http://172.16.0.5:7777/test/exam/manager/getAllSubjectLevel.action").success(function (data) {
                    handler(data);
                });
            },
            getAllDepartmentes : function (handler) {
                //$http.get("data/departmentes.json").success(function (data) {
                $http.get("http://172.16.0.5:7777/test/exam/manager/getAllDepartmentes.action").success(function (data) {
                    handler(data);
                });
            },
            getAllTopics : function (handler) {
                //$http.get("data/topics.json").success(function (data) {
                $http.get("http://172.16.0.5:7777/test/exam/manager/getAllTopics.action").success(function (data) {
                    handler(data);
                });
            }
        };
    }])
    .filter("selectTopics",function(){
        //input要过滤的内容，id为方向id
        return function(input,id){
            //filter方法进行过滤input为要过滤的元素
            if(input) {
                var result = input.filter(function (item) {
                    return item.department.id == id;
                });
                //返回过滤结果
                return result;
            }
        };
    })
    .directive("selectOption",function(){
    return {
        restrict:"A",
        link:function(scope,element){
            //element为使用了该指令的元素
           element.on("change",function(){
               var type = $(this).attr("type");//获取点击元素的类型
               var val = $(this).val();//获取点击元素的value值
               var isChecked = $(this).prop("checked");//获取点击元素是否选中
               if(type == "radio"){
                   //重置答案数组
                   scope.subject.choiceCorrect = [false,false,false,false];
                   //遍历
                    for(var i =0 ;i<4; i++){
                        //当点击元素为某一选项时，该选项为true。
                        if(val == i){
                            scope.subject.choiceCorrect[i] = true;
                        }
                    }
               }else if(type == "checkbox"){
                   for(var i =0 ;i<4; i++){
                       if(val == i && isChecked){
                           //当点击元素为某一选项时并且为该选项为选中时，该选项为true。
                           scope.subject.choiceCorrect[i] = true;
                       }else if(val ==i && !isChecked){
                           //当点击元素为某一选项时并且为该选项未选中时，该选项为false。
                           scope.subject.choiceCorrect[i] = false;
                       }
                   }
               }
               //强制消化
               scope.$digest();
           });
        }

    };
    });
