//Add to Question and Question Option form on the OnSave form Mthod

function onAntecedentSelection(executionContext) {
    let formContext = executionContext.getFormContext();
    let currentRecordGuid = formContext._entityReference.id ? formContext._entityReference.id.guid : null;
    let antecedentQRecord = formContext.getAttribute('xix_antecedentquestion');
    let antecedentORecord = formContext.getAttribute('xix_antecedentoption');
    let recordGuid = null;


    //Before completeting this add null checks and stuff
    if (antecedentQRecord.getValue()) {
        //add guid to dependent record question

        recordGuid = antecedentQRecord.getValue()[0].id.replace('{', '').replace('}', '');

        var entity = {};
        entity.xix_dependencyguids = currentRecordGuid;

        Xrm.WebApi.online.updateRecord("xix_question", recordGuid, entity).then(
            function success(result) {
                var updatedEntityId = result.id;
                console.log(updatedEntityId);
            },
            function (error) {
                Xrm.Utility.alertDialog(error.message);
            }
        );
    }
    else if (antecedentORecord.getValue()) {
        //add guid to dependent record question option
        recordGuid = antecedentORecord.getValue()[0].id.replace('{', '').replace('}', '');

        var entity = {};
        entity.xix_dependencyguids = currentRecordGuid;

        Xrm.WebApi.online.updateRecord("xix_questionoption", recordGuid, entity).then(
            function success(result) {
                var updatedEntityId = result.id;
                console.log(updatedEntityId);
            },
            function (error) {
                Xrm.Utility.alertDialog(error.message);
            }
        );
    }
}