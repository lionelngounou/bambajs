/**
 * @author Lionel.Ngounou
 * Bamba package/namespace 
 **/
if(typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, ''); 
  }
}

var Bamba = Bamba || (function(){
	var self = {};
	
	self.$getElementsByClassName = function(node, classname) {
		var elFound = [];
		var re = new RegExp('(^| )'+classname+'( |$)');
		var els = node.getElementsByTagName("*");
		for(var i=0,j=els.length; i<j; i++)
			if(re.test(els[i].className))
				elFound.push(els[i]);
		return elFound;
	};
	/**Bamba custom logging framework*/
	self.Logger = function($name){
		this.name = $name;
		this.LOGGING_DEBUG = false;
		this.LOGGING_INFO = false;
		this.LOGGING_WARNING = false;
		this.LOGGING_ERROR = true;
		this.logDebug = function(msg){
			if(this.LOGGING_DEBUG) {console.log(this.name + '(log debug) -:>', msg);}
		};
		this.logError = function(msg){
			if(this.LOGGING_ERROR) {console.error(this.name + '(log error) -:>', msg);}
		};
		this.logInfo = function(msg){
			if(this.LOGGING_INFO) {console.log(this.name + '(log info) -:>', msg);}
		};
		this.logWarning = function(msg){
			if(this.LOGGING_WARNING) {console.log(this.name + '(log warning) -:>', msg);}
		};
	};
	var UtilLogger = new self.Logger('UtilLogger'); 
	//UtilLogger.LOGGING_DEBUG=true;
	
	/**Attributes by which to get elements from DOM*/
	self.SelectorType = {ID:'id', CLASS:'class', NAME:'name'};
	
	/*Utilities centred on Strings*/
	self.StringUtil = {
		isString : function($str){
			return (typeof $str==='string');
		},
		isBlankOrNull : function($str){
			return ($str===null || (this.isString($str) && $str.trim().length===0));
		},
		isEmail : function($str){
			if(this.isBlankOrNull($str)) return false; 
			var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			return regex.test($str);
		}
	};
	
	self.isNullOrUndefined = function($obj){
		return ($obj===null || (typeof $obj === 'undefined'));
	};
	
	/**Pair a key and value with the given delimiter*/
	self.asPair = function($key, $value, $delimiter){
		return $key + $delimiter + $value;
	};
	
	/**An entry in a Map*/
	self.Entry = function($key, $value){
		this.key = $key;
		this.value = $value;
		this.equals = function($other){
			if(self.isNullOrUndefined($other)) return false;
			return (this.key === $other.key);
		};
		this.toString = function(){
			return "Entry[" + self.asPair(this.key, this.value, ':') + ']';
		};
		UtilLogger.logDebug(this.toString() + ' created');
	};
	
	/**key->value map represented in entries*/
	self.Map = function(){
		this.entrySet = [];
		this.putEntry = function($entry){
			UtilLogger.logDebug('Map.putEntry ' + $entry);
			if(self.isNullOrUndefined($entry)) return -1; //don't push
			for(var i=0; i<this.entrySet.length; i++){
				if(this.entrySet[i].equals($entry)){
					this.entrySet[i] = $entry;
					UtilLogger.logDebug('Map.putEntry (updated) at index ' + i);
					return i;
				}
			}
			var index = this.entrySet.push($entry) - 1;
			UtilLogger.logDebug('Map.putEntry (pushed) at index ' + index);
			return index;
		};
		this.put = function($key, $value){
			var entry = new self.Entry($key, $value);
			return this.putEntry(entry);
		};
		this.getEntry = function($key){
			UtilLogger.logDebug('Map.getEntry with key ' + $key);
			var entry = undefined;
			for(var i=0; i<this.entrySet.length; i++){
				if(this.entrySet[i].key === $key) {
					entry = this.entrySet[i];
					break;
				}
			}
			UtilLogger.logDebug('Map.getEntry found ' + entry);
			return entry;
		};
		this.get = function($key){
			var entry = this.getEntry($key);
			if(!self.isNullOrUndefined(entry)) return entry.value;
			return undefined;
		};
		this.removeEntry = function($entry){
			UtilLogger.logDebug('Map.removeEntry ' + $entry);
			if(!self.isNullOrUndefined(entry)) {
				var index = this.entrySet.indexOf($entry);
				if(index===-1) return null;
				this.entrySet.splice(index,1);
				UtilLogger.logDebug('Map.removeEntry at index ' + index);
				return $entry.value;
			}
			return undefined;
		};
		this.remove = function($key){
			var entry = this.getEntry($key);
			return this.removeEntry(entry);
		};
		this.keySet = function(){
			var keys = [];
			for(var i=0; i<this.entrySet.length; i++)
				keys.push(this.entrySet[i].key);
			return keys;
		};
	};
	
	var AppLogger = new self.Logger('MVCApplicationLogger'); 
	//AppLogger.LOGGING_DEBUG=true;
	
	self.Model = function(){
		var properties = new self.Map(); //or use {} ??? :todo
		this.getProperties = function(){
			return properties;
		};
		this.beforeChange = function($propertyName, $newValue){
			AppLogger.logDebug('Model.beforeChange propertyName: ' + $propertyName + ' new value: ' + $newValue);
			//should handle change with self
			return true;
		};
		this.afterChange = function($propertyName, $oldValue){
			AppLogger.logDebug('Model.afterChange propertyName: ' + $propertyName + ' old value: ' + $oldValue);
			//should handle change with self
			return true;
		};
		this.prop = function($name, $value){
			AppLogger.logDebug('Model.prop name: ' + $name + ' value: ' + $value);
			if(self.isNullOrUndefined($value)){
				AppLogger.logDebug('Model.prop - get value of: ' + $name);
				return this.getProperties().get($name);
			}
			else{
				AppLogger.logDebug('Model.prop - set/put value of: ' + $name);
				var oldValue = this.getProperties().get($name);
				var oldValueExists = (oldValue!==undefined);
				if(oldValueExists) 
					this.beforeChange($name, $value);
				this.getProperties().put($name,$value);
				if(oldValueExists) 
					this.afterChange($name, oldValue);
			}
		};
		this.toString = function(){
			var str = "";
			var names = this.getProperties().keySet();
			for(var i=0; i<names.length; i++){
				var name = names[i];
				var value = this.getProperties().get(name);
				var pair = self.asPair(name, value, ":");
				if(str==="") str += pair;
				else str += (" , " + pair);
			}
			return str ;
		};
		this.fromJSON = function($JSONobj){
			var model = new self.Model();
			model.populateWithJSON($JSONobj);
			return model;
		};
		this.populateWithJSON = function($JSONobj){
			for(var k in $JSONobj){
				if($JSONobj.hasOwnProperty(k))
					this.prop(k, $JSONobj[k]);
			}
		};
		this.toJSON = function(){
			var obj = {};
			var names = this.getProperties().keySet();
			for(var i=0; i<names.length; i++){
				var name = names[i];
				var value = this.getProperties().get(name);
				obj[name] = value;
			}
			return obj;
		};
		this.toJSONString = function(){
			return JSON.stringify(this.toJSON());
		};
		this.toURLParams = function(){
			var str = "";
			var names = this.getProperties().keySet();
			for(var i=0; i<names.length; i++){
				var name = names[i];
				var value = this.getProperties().get(name);
				if(typeof value === "undefined") 
					value='';
				var pair = self.asPair(encodeURIComponent(name), encodeURIComponent(value), "=");
				if(str==="") str += pair;
				else str += ("&" + pair);
			}
			return str ;
		};
		this.getValidation = function($modelValidator){
			return $modelValidator.validate(this.toJSON());
		};
	};
	
	self.ValidationError = function($property, $message){
		this.property = $property;
		this.message = $message ;
	};
	
	self.ModelValidation = function($passed, $errors){
		this.passed = $passed;
		this.errors = $errors || [];
	};
	
	self.ModelValidator = function(){
		/**returns a model validation object*/
		this.validate = function($modelAsObj){
			return new self.ModelValidation(true);
		};
	};
	
	self.getValidation = function($objToValidate, $propertiesValidations) {
		var validation = new self.ModelValidation(true);
		var strUtil = self.StringUtil;
		var requiredMsg = self.ErrorMessage.requiredProperty;
		//var invalidMsg = Bamba.ErrorMessage.invalidProperty;
		for (var x = 0; x < $propertiesValidations.length; x++) {
			var propValidation = $propertiesValidations[x];
			var property = propValidation.property;
			var label = propValidation.label || property;
			var attributes = propValidation.attributes;
			if (property && attributes) {
				var value = $objToValidate[property] || '';
				value += ''; //transform to string
				if (attributes.required && strUtil.isBlankOrNull(value)) {
					validation.passed = false;
					validation.errors.push(new self.ValidationError(property, requiredMsg(label)));
				}
				var custom = attributes.custom;
				if (custom && !custom.isValid($objToValidate)) {
					validation.passed = false;
					validation.errors.push(new self.ValidationError(property, custom.errorMessage));
				}
			}
		}
		return validation;
	};
	
	self.ErrorMessage = {
		requiredProperty : function($property){ return $property + ' is required';},
		invalidProperty : function($property){ return $property + ' is invalid';}
	};
	
	self.ModelManager = function($app){
		var models = [];
		this.getApp = function(){
			return $app;
		};
		this.getModel = function($index){
			return models[$index];
		};
		this.comparator = null;
		this.getModels = function(){
			var modelsProxy = [];
			for (var x=0; x<models.length; x++)
				modelsProxy[x] = models[x];
			return modelsProxy;
		};
		this.beforeAdd = function($model){};
		this.afterAdd = function($model){};
		this.addModel = function($model){
			this.beforeAdd($model);
			if(self.isNullOrUndefined($model)) return -1;
			var index = (models.push($model) - 1);
			//$model.prop('index', index);
			this.changed();
			this.afterAdd($model);
			return index;
		};
		this.deleteModel = function($index){
			var model = this.getModel($index);
			models.splice($index,1);
			this.changed();
			model.prop('index', -1);
			return model;
		};
		this.updateModel = function($index, $objParams){
			var model = this.getModel($index);
			model.populateWithJSON($objParams);
			this.changed();
			return model;
		};
		this.createModel = function($objParams){
			var model = new self.Model();
			model.populateWithJSON($objParams);
			this.addModel(model);
			return model;
		};
		this.changed = function(){
			this.sortModels();
			resetModelIndexes();
		};
		this.sortModels = function(){
			if(!self.isNullOrUndefined(this.comparator)){
				models.sort(this.comparator);
			}
		};
		this.init = function($initialModelObjects){
			if(!self.isNullOrUndefined($initialModelObjects) && $initialModelObjects.length>0) {
				models.length = 0;
				for(var x=0; x<$initialModelObjects.length; x++){
					var model = new self.Model();
					model.populateWithJSON($initialModelObjects[x]);
					var index = models.push(model) - 1;
					//model.prop('index', index);
				}
				this.changed();
			}
		};
		function resetModelIndexes(){
			for (var x=0; x<models.length; x++)
				models[x].prop('index', x);
		}
		this.resetModelIndexes = resetModelIndexes;
	};
	
	self.ViewManager = function($app){
		this.getApp = function(){
			return $app;
		};
		this.getAppContext = function(){
			return this.getApp().context;
		};
		this.getElement = function($container, $identifier){
			var elements = this.getElements($container, $identifier);
			if(self.isNullOrUndefined(elements)) return undefined;
			return elements[0];
		};
		this.getElements = function($container, $identifier){
			if(this.getAppContext().selectorType === self.SelectorType.ID){
				return [$container.getElementById($identifier)];
			}
			else if(this.getAppContext().selectorType === self.SelectorType.NAME){
				return $container.getElementsByName($identifier);
			}
			else{ //self.SelectorType.CLASS by default
				if($container.getElementsByClassName){
					return $container.getElementsByClassName($identifier);
				}
				else{
					return Bamba.$getElementsByClassName($container, $identifier);
				}
			}
		};
		this.getAppElement = function($identifier){//self.SelectorType.CLASS by default
			return this.getElement(this.getAppContainer(), $identifier);
		};
		this.getAppElements = function($identifier){//self.SelectorType.CLASS by default
			return this.getElements(this.getAppContainer(), $identifier);
		};
		this.getAppContainer = function(){
			var identifier = this.getAppContext().identifiers.app.eval();
			return this.getElement(document, identifier);
		};
		this.getFormContainer = function(){
			var identifier = this.getAppContext().identifiers.form.eval();
			return this.getElement(document, identifier);
			//return this.getAppElement(identifier); the form may not be inside the app
		};
		this.getFormErrorsContainer = function(){
			var identifier = this.getAppContext().identifiers.formErrorsContainer.eval();
			return this.getElement(this.getFormContainer(), identifier);
		};
		this.getIndexedViewContainers = function(){
			var identifier = this.getAppContext().identifiers.indexedViewContainer.eval();
			return this.getAppElements(identifier);
		};
		this.getIndexedViewContainer = function(){
			var identifier = this.getAppContext().identifiers.indexedViewContainer.eval();
			return this.getAppElement(identifier);
		};
		this.getView = function(){
			var identifier = this.getAppContext().identifiers.view.eval();
			return this.getAppElement(identifier);
		};
		this.getIndexedView = function($index){
			var identifier = this.getAppContext().identifiers.indexedView.eval($index);
			return this.getElement(this.getIndexedViewContainer(), identifier);
		};
		/**abstract*/
		this.renderFormWithParams = function($params){/*implementation depends on app*/};
		this.renderFormWithModel = function($model){
			this.renderFormWithParams($model.toURLParams());
		};
		this.renderForm = function(){
			this.renderFormWithParams('');
		};
		/**abstract*/
		this.discardForm = function(){ /*implementation depends on app*/};
		this.loadModelObjectFromForm = function(){
			var obj = {};
			var propertyNames = this.getAppContext().modelPropertyNames;
			var formContainer = this.getFormContainer(); 
			for(var v=0; v< propertyNames.length; v++){
				var propertyName = propertyNames[v];
				var propertyIdentifier = this.getAppContext().identifiers.propertySetter.eval(propertyName);
				var elements = [];
				if(formContainer.getElementsByClassName)
					elements = formContainer.getElementsByClassName(propertyIdentifier);
				else 
					elements = Bamba.$getElementsByClassName(formContainer, propertyIdentifier);
				var propertyValue = null;
				if(elements.length===1){
					propertyValue = getElementValue(elements[0]);
				}
				else if(elements.length>1){
					propertyValue = [];
					for(var x=0; x<elements.length; x++){
						propertyValue[x] = getElementValue(elements[x]);
					}
				}
				obj[propertyName] = propertyValue;
			}
			return obj;
		};
		this.setContainerHTML = function($container, $_HTML){
			$container.innerHTML = $_HTML;
		};
		this.updateModelIndexedView = function($model){
			this.setContainerHTML(this.getIndexedView($model.prop('index')), this.buildInnerModelIndexedView($model));
		};
		this.addModelToIndexedView = function($model){
			var container = this.getIndexedViewContainer(); 
			var _HTML = container.innerHTML + this.buildModelIndexedView($model);
			this.setContainerHTML(container, _HTML);
		};
		/*abstract method to be overridden */
		this.resetIndexedViewWithModels = function($models){
			var container = this.getIndexedViewContainer(); 
			var _HTML = '';
			for(var x=0; x<$models.length; x++){
				var model = $models[x];
				_HTML += this.buildModelIndexedView(model, x);
			}
			this.setContainerHTML(container, _HTML);
		};
		/**abstract*/
		this.buildInnerModelIndexedView = function($model){ /*implementation depends on app*/ };
		/**abstract*/
		this.buildModelIndexedView = function($model, $displayIndex){ /*implementation depends on app*/ };
		
		this.renderFormValidationErrors = function($validationErrors){
			var container = this.getFormErrorsContainer();
			container.className = container.className.replace('hidden','');
			var _HTML = '<ul>';
			for(var x=0; x<$validationErrors.length; x++)
				_HTML += '<li>'+$validationErrors[x].message+'</li>';
			_HTML += '</ul>';
			this.setContainerHTML(container, _HTML);
		};
		
		function getElementValue($element){
			var elementType = $element.type;
			var elementValue = undefined;
			if(elementType==="select-one"){
				elementValue = $element.options[$element.selectedIndex].value;
			}
			else if(elementType==="select-multiple"){
				elementValue = [];
				for (var x = 0; x < $element.length; x++) {
					var option = $element.options[x];
					if(option.selected)
						elementValue.push(option.value);
				}
			}
			else{
				elementValue = $element.value;
			}
			return elementValue;
		}
	};
	
	self.Controller = function($app){
		this.getApp = function(){
			return $app;
		};
		this.getModelManager = function(){
			return this.getApp().getModelManager();
		};
		this.getViewManager = function(){
			return this.getApp().getViewManager();
		};
		this.index = function(){
			this.getViewManager().resetIndexedViewWithModels(this.getModelManager().getModels());
			return true;
		};
		this.create = function($event){
			this.handleEvent($event);
			this.getViewManager().renderForm();
			return true;
		};
		this.edit = function($index, $event){
			this.handleEvent($event);
			var model = this.getModelManager().getModel($index);
			if(self.isNullOrUndefined(model)) 
				return;
			this.getViewManager().renderFormWithParams(model.toURLParams());
			return true;
		};
		this.save = function($index, $event){
			this.handleEvent($event);
			//var model = null; 
			var _viewManager = this.getViewManager(), _modelManager = this.getModelManager();
			var obj = _viewManager.loadModelObjectFromForm();
			var propertiesValidationDetails = this.getApp().context.propertiesValidationDetails;
			if(!self.isNullOrUndefined(propertiesValidationDetails)){
				var validation = self.getValidation(obj, propertiesValidationDetails);
				if(validation.passed===false){
					_viewManager.renderFormValidationErrors(validation.errors);
					return false;
				}
			}
			_viewManager.discardForm();
			if(self.isNullOrUndefined($index) || $index<0){
				_modelManager.createModel(obj);
				//this.getViewManager().addModelToIndexedView(model);
			}
			else{
				_modelManager.updateModel($index, obj);
				//_viewManager.updateModelIndexedView(model);
			}
			_viewManager.resetIndexedViewWithModels(_modelManager.getModels());
			return true;
		};
		this.$delete = function($index, $event){
			this.handleEvent($event);
			this.getViewManager().discardForm();
			this.getModelManager().deleteModel($index);
			this.getViewManager().resetIndexedViewWithModels(this.getModelManager().getModels());
			return true;
		};
		this.cancel = function($event){
			this.handleEvent($event);
			this.getViewManager().discardForm();
			return true;
		};
		this.handleEvent = function($event){
			if(self.isNullOrUndefined($event)) return false;
			if($event.preventDefault) $event.preventDefault();
			if($event.returnValue) $event.returnValue = false;
		};
	};
	
	self.MVCApplication = function($args){
		var _app_ = this;
		if( self.isNullOrUndefined($args.modelNameSpace) || self.StringUtil.isBlankOrNull($args.modelNameSpace)) {
			$args.modelNameSpace = $args.modelName;
		}
		this.context = { 
			modelName : $args.modelName, 
			modelNameSpace : $args.modelNameSpace,
			modelPropertyNames : $args.modelPropertyNames,
			propertiesValidationDetails : $args.propertiesValidationDetails,
			selectorType : self.SelectorType.CLASS, 
			identifiers : {
				generalEval : function($template){
					var _context = _app_.context;
					return $template.replace("{{modelNameSpace}}", _context.modelNameSpace);
				},
				app : {
					template: "{{modelNameSpace}}-app", 
					eval: function(){ return _app_.context.identifiers.generalEval(this.template); }
				}, 
				form : {
					template: "{{modelNameSpace}}-form", 
					eval: function(){ return _app_.context.identifiers.generalEval(this.template); }
				}, 
				formErrorsContainer : { 
					template: "{{modelNameSpace}}-form-errors", 
					eval: function(){ return _app_.context.identifiers.generalEval(this.template); }
				},
				indexedViewContainer : {
					template: "{{modelNameSpace}}-list-view-container", 
					eval: function(){ return _app_.context.identifiers.generalEval(this.template); }
				}, 
				viewContainer : {
					template: "{{modelNameSpace}}-view-container", 
					eval: function(){ return _app_.context.identifiers.generalEval(this.template); }
				}, 
				view : {
					template: "{{modelNameSpace}}-view", 
					eval: function(){ return _app_.context.identifiers.generalEval(this.template); }
				}, 
				indexedView : {
					template: "{{modelNameSpace}}-{{index}}-view", 
					eval: function($index){
						return _app_.context.identifiers.generalEval(this.template).replace("{{index}}", $index);
					}
				}, 
				propertySetter : {
					template: "{{modelNameSpace}}-{{propertyName}}-set",
					eval: function($propertyName){
						return _app_.context.identifiers.generalEval(this.template).replace("{{propertyName}}", $propertyName);
					}
				}, 
				propertyGetter : { 
					template: "{{modelNameSpace}}-{{propertyName}}-get",
					eval: function($propertyName){
						return _app_.context.identifiers.generalEval(this.template).replace("{{propertyName}}", $propertyName);
					}
				}, 
				indexedPropertyGetter : {
					template: "{{modelNameSpace}}-{{index}}-{{propertyName}}-get",
					eval: function($propertyName, $index){
						return _app_.context.identifiers.generalEval(this.template)
								.replace("{{propertyName}}", $propertyName).replace("{{index}}", $index);
					}
				}
			}
		};
		var modelManager = new self.ModelManager(this);
		var viewManager = new self.ViewManager(this);
		var controller = new self.Controller(this);
		this.getModelManager = function(){ 
			return modelManager; 
		};
		this.getViewManager = function(){ 
			return viewManager; 
		};
		this.getController = function(){
			return controller;
		};
		this.init = function(){
			this.getModelManager().init($args.initialModelObjects);
			this.getController().index();
		};
		
	};
	
	return self;
}());

