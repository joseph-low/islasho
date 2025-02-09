// This script sorts linked records in numerical / alphabetical order
// For multi dimension sorting (combination of alphabet, number, date),
// create a formula field in AT that converts and contains all the fields
// to sort by into a single value - eg. 1.1A, 1.1B, 1.1C


// Grab the trigger record's ID
let inputConfig = input.config();
let recordID = inputConfig.recordID;

// Load tables and respective fields (columns)
let parentTable = base.getTable('mainTable');
let childTable = base.getTable('tableWithSortingFields');
let parentQueryResult = await parentTable.selectRecordsAsync({ fields: ['linkedRecordsField'], });
let childQueryResult = await childTable.selectRecordsAsync({ fields: ['sortingField'] });

// Get the record to update (trigger record)
let record = parentQueryResult.getRecord(`${inputConfig.recordID}`);

// Get the linked records array of the record to update
let linkedRecordsArray = record.getCellValue('linkedRecordsField');

if (linkedRecordsArray) {
    // For each linked record (object), assign a sortValue object
    for (var linkedRecord of linkedRecordsArray) {
        linkedRecord['sortValue'] = childQueryResult
            .getRecord(linkedRecord.id)
            .getCellValue('sortingField');
    }

    // Sort the linked records array
    // For descending / ascending, switch the -1 and 1
    linkedRecordsArray.sort(function (a, b) {
        var x = a.sortValue.name;
        var y = b.sortValue.name;
        if (x < y) {
            return -1;
        }
        if (x > y) {
            return 1;
        }
        return 0;
    });

    // Remove the assigned sortValue object from the linked records object
    for (let obj of linkedRecordsArray) {
        delete obj.sortValue;
    }

    // Update the trigger record with the sorted linked records array
    parentTable.updateRecordAsync(record, {
        'linkedRecordsField': linkedRecordsArray,
    });
}
