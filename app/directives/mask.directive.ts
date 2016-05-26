import {Directive, Attribute} from 'angular2/core';
import {NgModel} from 'angular2/common';
 
@Directive({ 
    selector: '[mask]', 
    host: {
        '(keyup)' : 'onInputChange()'
    }
})
export class MaskDirective{
    maskPattern: string;
    placeHolderCounts:int;
    dividers: string[];
    modelValue: string;
    viewValue: string;
    
    constructor(public model:NgModel, @Attribute("mask")maskPattern: string){
        this.dividers = maskPattern.replace(/\*/g,"").split("");
        this.dividers.push(" ");
        this.generatePattern(maskPattern);
    }
    
    onInputChange(){
        this.modelValue = this.getModelValue();
        var stringToFormat = this.modelValue;
        if(stringToFormat.length < 10){
            stringToFormat = this.padString(stringToFormat);
        }
        
        this.viewValue = this.format(stringToFormat);
        this.model.viewToModelUpdate(this.modelValue);
        this.model.valueAccessor.writeValue(this.viewValue)
    }
    
    generatePattern(patternString){
        this.placeHolderCounts = (patternString.match(/\*/g) || []).length;
        for(var i = 0; i < this.placeHolderCounts; i++){
            patternString = patternString.replace('*',"{" + i + "}");
        }
        this.maskPattern = patternString;
    }
    
    format(s) {
        var formattedString = this.maskPattern;
        for(var i = 0; i < this.placeHolderCounts; i++){
            formattedString = formattedString.replace("{" + i + "}", s.charAt(i));
        }
        return formattedString;
    }
    
    padString(s){
        var pad = " ";
        return (s + pad).substring(0, pad.length);
    }
    
    getModelValue(){
        var modelValue = this.model.value;
        for(var i = 0; i < this.dividers.length; i++){
            while(modelValue.indexOf(this.dividers[i]) > -1){
                modelValue = modelValue.replace(this.dividers[i], "");
            }
        }
        return modelValue;
    }
}