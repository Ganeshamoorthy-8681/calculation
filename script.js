//Getting Basic Input Elements 
const totalEbsVolumeSize = document.getElementById('EBS-volume-size');
const ebsChangeRate = document.getElementById('EBS-change-rate');
const protectionInterval = document.getElementById('protection-interval');
const primaryRetentionCopies = document.getElementById('primary-retention');
const remoteRetentionCopies = document.getElementById('remote-retention');
const totalProtectionPerMonth = document.getElementById('total-protection');
const allInputFields = document.getElementsByClassName('container__input__element');
const primaryRegion = document.getElementById('primary-region');
const remoteRegion = document.getElementById('remote-region');

//overall Calcuated Values 
const primaryRegionLocalProtection = document.getElementById('primary-region-local-protection');
const remoteRegionStorageCost = document.getElementById('remote-region-storage-cost');
const interRegionDataTransferCost = document.getElementById('inter-region-data-transfer-cost');
const overallTotalCost = document.getElementById('total-cost');

//Getting elements used in primary region calculation
const primaryRegionEbsVolumeSize = document.getElementById("primary-region-EBS-volume-size-in-gb");
const primaryRegionEbsChangeBetweenProtections = document.getElementById('primary-region-EBS-change-between-protection')
const primaryRegionFirstSnapshotSize = document.getElementById('primary-region-first-snapshot-storage-size');
const primaryRegionRetentionCopies = document.getElementById('primary-region-retention-copies-incremental-storage-size');
const primaryRegionSnapshotStorageSize = document.getElementById("primary-region-snapshot-storage-size")
const primaryRegionSnapShotCost = document.getElementById('primary-region-snapshot-cost');
const primaryRegionEgressNetworkCost = document.getElementById('primary-region-egress-network-cost');
const primaryRegionTotalCost = document.getElementById('primary-region-totalcost');
const primaryRegionSnapshotCostPerGib = document.getElementById('primary__snapshot__cost');
const primaryRegionDataTransferCostPerGib = document.getElementById('primary__data-transfer__cost');

//Getting elements used in remote region calculation
const remoteRegionFullSnapshotSize = document.getElementById('remote-region-full-snapshot-size');
const remoteRegionIncrementalStorageSize = document.getElementById('remote-region-incremental-storage-size')
const remoteRegionRetentionCopies = document.getElementById('remote-region-retention-copies-incremental-storage-size');
const remoteRegionStorageSize = document.getElementById('remote-region-storage-size');
const remoteRegionSnapshotStorageCost = document.getElementById('remote-region-snapshot-storage-cost');
const remoteRegionIngressNetworkCost = document.getElementById('remote-region-ingress-network-cost');
const remoteRegionTotalCost = document.getElementById('remote-region-totalcost');
const remoteRegionSnapshotCostPerGib = document.getElementById('remote__snapshot__cost');
const remoteRegionDataTransferCostPerGib = document.getElementById('remote__data-transfer__cost');

//Variables used to store the values of base inputs to proceed further 
let totalEbsVolumeSizeValue = 0;
let ebsChangeRateValue = 0;
let protectionIntervalValue = 0;
let primaryRetentionCopiesValue = 0;
let remoteRetentionCopiesValue = 0;
let totalProtectionPerMonthValue = 0;
let primaryRegionValue = '';
let remoteRegionValue = '';
let primaryRegionDataCostJson, remoteRegionDataCostJson;
let primaryRegionEbsServiceJson, remoteRegionEbsServiceJson

//used to obtain dollar value
let formatting_options = {
    style: 'currency',
    currency: 'USD',
}

//This object represents the primary region
let primaryRegionCalculatedValues = {
    totalEbsVolumeSizeInGb: 0,
    ebsChangeBetweenProtection: 0,
    firstSnapshotStorageSize: 0,
    retentionCopies: 0,
    snapshotStorageSize: 0,
    snapshotCost: 0,
    egressNetworkCost: 0,
    totalCost: 0
};

//This object represents the remote region
let remoteRegionCalculatedValues = {
    fullSnapshotStorageSize: 0,
    incrementalStorageSize: 0,
    retentionCopies: 0,
    snapshotStorageSize: 0,
    snapshotStorageCost: 0,
    ingressNetworkcost: 0,
    totalCost: 0
};


function formatNumber(number) {
    if (number == '' || number == NaN || number == undefined || number == "Infinity")
        return 0
    else
        return parseFloat(number)
}

//This function avoids displaying NaN in  UI
function formatCurrencyAndData(data) {
    if (data == '$NaN') {
        return "$0.00"
    } else {
        return data
    }
}

function formatNumberPrecision(number) {
    if (Number.isInteger(number))
        return (number);
    else
        return parseFloat(number.toFixed(2));
}

function renderAllValues() {
    totalEbsVolumeSizeValue = formatNumber(totalEbsVolumeSize.value);
    ebsChangeRateValue = formatNumber(ebsChangeRate.value);
    protectionIntervalValue = formatNumber(protectionInterval.value);
    primaryRetentionCopiesValue = formatNumber(primaryRetentionCopies.value);
    remoteRetentionCopiesValue = formatNumber(remoteRetentionCopies.value);
    primaryRegionValue = primaryRegion.value;
    remoteRegionValue = remoteRegion.value;
};



async function getRegionDataCost(region) {
    //Fetches the Region Data Cost file 
    try {
        let response = await fetch(`aws-pricing/${region}.json`);
        let jsonData = await response.json();
        // console.log("region data received");
        return jsonData;
    } catch (error) {
        // console.log(error);;
    }
}


async function renderRegionCostDataValues() {
    //Gets the primary and remote region Data Cost data
    try {
            primaryRegionDataCostJson = await getRegionDataCost(primaryRegionValue);
            remoteRegionDataCostJson = await getRegionDataCost(remoteRegionValue);
        // console.log("primary and remote region values rendered"); 
    }
    catch (error) {
        console.log(error);
    }
}

async function changeEventHandler(event) {
    //Gets the  current value in input field given by user 
    try {
        renderAllValues();
        totalProtectionPerMonthValue = calculateTotalProtectionPerMonth(protectionIntervalValue);
        totalProtectionPerMonth.textContent = formatNumber(totalProtectionPerMonthValue);
        //Gets the region cost data's
        await renderRegionCostDataValues()
            .then(() => {
                //Updates the Region cost
                updateRegioncost();
                //Calculate the Required values in primary region
                primaryRegioncalulation();
                //Calculate the Required values in remote region
                remoteRegionCalculation();
                //Updates the calculated values in DOM for Primary region
                updatePrimaryRegionValues();
                //Updates the calculated values in DOM for remote region
                updateRemoteRegionValues();
                //Update the general values
                updateGeneralCost();
            })
    } catch (error) {
        // console.log(error);
    }
};


function updateRegioncost() {
    let primaryRegionSpecificCostRegionJson;
    let primaryRegionSpecificCostRegionList = [];

    if (primaryRegionValue) {
        primaryRegionEbsServiceJson = primaryRegionDataCostJson["services"]["ebsVolumeSize"];
        primaryRegionSpecificCostRegionJson = primaryRegionEbsServiceJson["specificOutboundCost"];
    } 
         
    if(remoteRegionValue) 
        remoteRegionEbsServiceJson = remoteRegionDataCostJson["services"]["ebsVolumeSize"];
    
    if (primaryRegionSpecificCostRegionJson)
        primaryRegionSpecificCostRegionList = Object.keys(primaryRegionSpecificCostRegionJson);

    if (primaryRegionSpecificCostRegionList.includes(remoteRegionValue))
        primaryRegionDataTransferCostPerGib.textContent = (primaryRegionSpecificCostRegionJson[remoteRegionValue]);
    else
        primaryRegionDataTransferCostPerGib.textContent = (primaryRegionEbsServiceJson["generalOutboundCost"]);

    if(primaryRegionEbsServiceJson["snapshotCost"])
        primaryRegionSnapshotCostPerGib.textContent = (primaryRegionEbsServiceJson["snapshotCost"]);
    
    if(remoteRegionEbsServiceJson["snapshotCost"])
        remoteRegionSnapshotCostPerGib.textContent = (remoteRegionEbsServiceJson["snapshotCost"]);
    // console.log(" updatation of region cost is completed");
}


// function convertGbToGib(number) {
//    //Converts the values in GB to GiB
//    return (number * 1000 / 1024).toFixed(4);
// }


function updateGeneralCost() {
    primaryRegionLocalProtection.textContent = formatCurrencyAndData(Intl.NumberFormat('en-US', formatting_options).format(
        primaryRegionCalculatedValues.snapshotCost));
    remoteRegionStorageCost.textContent = formatCurrencyAndData(Intl.NumberFormat('en-US', formatting_options).format(
        remoteRegionCalculatedValues.snapshotStorageCost));
    interRegionDataTransferCost.textContent = formatCurrencyAndData(Intl.NumberFormat('en-US', formatting_options).format(
        primaryRegionCalculatedValues.egressNetworkCost));
    overallTotalCost.textContent = formatCurrencyAndData(Intl.NumberFormat('en-US', formatting_options).format(
        calculateOverallTotalCost(primaryRegionCalculatedValues.snapshotCost,
            remoteRegionCalculatedValues.snapshotStorageCost,
            primaryRegionCalculatedValues.egressNetworkCost)));
}


function primaryRegioncalulation() {
    primaryRegionCalculatedValues.totalEbsVolumeSizeInGb = calculateTotalEbsVolumeInGb(totalEbsVolumeSizeValue);
    primaryRegionCalculatedValues.ebsChangeBetweenProtection =
        calculateEbsChangebetweenProtection(primaryRegionCalculatedValues.totalEbsVolumeSizeInGb, ebsChangeRateValue);
    primaryRegionCalculatedValues.firstSnapshotStorageSize = primaryRegionCalculatedValues.totalEbsVolumeSizeInGb;
    primaryRegionCalculatedValues.retentionCopies =
        calculateRetentionCopiesWithIncrementalSize(primaryRetentionCopiesValue, primaryRegionCalculatedValues.ebsChangeBetweenProtection);
    primaryRegionCalculatedValues.snapshotStorageSize =
        calculateRegionSnapshotStorageSize(primaryRegionCalculatedValues.firstSnapshotStorageSize, primaryRegionCalculatedValues.retentionCopies);
    primaryRegionCalculatedValues.snapshotCost =
        calculateRegionSnapshotCost(primaryRegionCalculatedValues.snapshotStorageSize, parseFloat(primaryRegionSnapshotCostPerGib.textContent));
    primaryRegionCalculatedValues.egressNetworkCost =
        calculateRegionNetworkCost(totalProtectionPerMonthValue, parseFloat(primaryRegionDataTransferCostPerGib.textContent), primaryRegionCalculatedValues.retentionCopies);
    primaryRegionCalculatedValues.totalCost =
        calculateRegionTotalCost(primaryRegionCalculatedValues.snapshotCost, primaryRegionCalculatedValues.egressNetworkCost);
};


function remoteRegionCalculation() {
    remoteRegionCalculatedValues.fullSnapshotStorageSize = primaryRegionCalculatedValues.firstSnapshotStorageSize;
    remoteRegionCalculatedValues.incrementalStorageSize = primaryRegionCalculatedValues.ebsChangeBetweenProtection;
    remoteRegionCalculatedValues.retentionCopies =
        calculateRetentionCopiesWithIncrementalSize(remoteRegionCalculatedValues.incrementalStorageSize, remoteRetentionCopiesValue);
    remoteRegionCalculatedValues.snapshotStorageSize =
        calculateRegionSnapshotStorageSize(remoteRegionCalculatedValues.fullSnapshotStorageSize, remoteRegionCalculatedValues.retentionCopies);
    remoteRegionCalculatedValues.snapshotStorageCost =
        (calculateRegionSnapshotCost(remoteRegionCalculatedValues.snapshotStorageSize, parseFloat(remoteRegionSnapshotCostPerGib.textContent)));
    remoteRegionCalculatedValues.ingressNetworkcost =
        calculateRegionNetworkCost(totalProtectionPerMonthValue, 0, remoteRegionCalculatedValues.retentionCopies);
    remoteRegionCalculatedValues.totalCost =
        (calculateRegionTotalCost(remoteRegionCalculatedValues.snapshotStorageCost, remoteRegionCalculatedValues.ingressNetworkcost));
}


function updatePrimaryRegionValues() {
    primaryRegionEbsVolumeSize.textContent = primaryRegionCalculatedValues.totalEbsVolumeSizeInGb;
    primaryRegionEbsChangeBetweenProtections.textContent = primaryRegionCalculatedValues.ebsChangeBetweenProtection;
    primaryRegionFirstSnapshotSize.textContent = primaryRegionCalculatedValues.firstSnapshotStorageSize;
    primaryRegionRetentionCopies.textContent = primaryRegionCalculatedValues.retentionCopies
    primaryRegionSnapshotStorageSize.textContent = primaryRegionCalculatedValues.snapshotStorageSize;
    primaryRegionSnapShotCost.textContent = formatCurrencyAndData(Intl.NumberFormat('en-US', formatting_options).format(primaryRegionCalculatedValues.snapshotCost));
    primaryRegionEgressNetworkCost.textContent = formatCurrencyAndData(Intl.NumberFormat('en-US', formatting_options).format(primaryRegionCalculatedValues.egressNetworkCost));
    primaryRegionTotalCost.textContent = formatCurrencyAndData(Intl.NumberFormat('en-US', formatting_options).format(primaryRegionCalculatedValues.totalCost));
}


function updateRemoteRegionValues() {
    remoteRegionFullSnapshotSize.textContent = remoteRegionCalculatedValues.fullSnapshotStorageSize;
    remoteRegionIncrementalStorageSize.textContent = remoteRegionCalculatedValues.incrementalStorageSize;
    remoteRegionRetentionCopies.textContent = remoteRegionCalculatedValues.retentionCopies;
    remoteRegionStorageSize.textContent = remoteRegionCalculatedValues.snapshotStorageSize;
    remoteRegionSnapshotStorageCost.textContent = formatCurrencyAndData(Intl.NumberFormat('en-US', formatting_options).format(remoteRegionCalculatedValues.snapshotStorageCost));
    remoteRegionIngressNetworkCost.textContent = formatCurrencyAndData(Intl.NumberFormat('en-US', formatting_options).format(remoteRegionCalculatedValues.ingressNetworkcost));
    remoteRegionTotalCost.textContent = formatCurrencyAndData(Intl.NumberFormat('en-US', formatting_options).format(remoteRegionCalculatedValues.totalCost));
}


function calculateTotalProtectionPerMonth(protectionIntervalValue) {
    return formatNumberPrecision(24 * 30 / protectionIntervalValue);
}


function calculateTotalEbsVolumeInGb(totalEbsVolumeSizeValue) {
    return formatNumberPrecision(totalEbsVolumeSizeValue * 1024);
}


function calculateEbsChangebetweenProtection(totalEbsVolumeSizeInGb, ebschangeRateValue) {
    return formatNumberPrecision(totalEbsVolumeSizeInGb * ebsChangeRateValue / 100);
}


function calculateRetentionCopiesWithIncrementalSize(retentionCopiesValue, ebsChangeBetweenProtection) {
    return formatNumberPrecision(retentionCopiesValue * ebsChangeBetweenProtection);
}


function calculateRegionSnapshotStorageSize(firstSnapshotStorageSize, retentionCopiesWithIncrementalSize) {
    return formatNumberPrecision(firstSnapshotStorageSize + retentionCopiesWithIncrementalSize);
}


function calculateRegionSnapshotCost(snapshotStorageSize, regionalCost) {
    return formatNumberPrecision(formatNumber(snapshotStorageSize * regionalCost));
}


function calculateRegionNetworkCost(totalProtectionPerMonth, regionalCost, retentionCopies) {
    return formatNumberPrecision(formatNumber(totalProtectionPerMonth * regionalCost * retentionCopies));
}


function calculateRegionTotalCost(snapshotCost, networkCost) {
    return formatNumberPrecision(formatNumber(snapshotCost + networkCost));
}

function calculateOverallTotalCost(primaryRegionSnapshotCost, remoteRegionSnapshotCost, primaryNetworkCost) {
    return formatNumberPrecision(formatNumber(primaryRegionSnapshotCost + remoteRegionSnapshotCost + primaryNetworkCost));
}


//Adds the event to the dropdowns 
primaryRegion.addEventListener('change', changeEventHandler);
remoteRegion.addEventListener("change", changeEventHandler);

//Adds the event to the base input fields
for (let inputElement of allInputFields) {
    inputElement.addEventListener('change', changeEventHandler);

    inputElement.addEventListener('focus', (e) => {
        e.target.nextElementSibling.classList.add('placeholder-color-focused');
        e.target.nextElementSibling.classList.add('focused');
    })

    inputElement.addEventListener('blur', (e) => {
        e.target.nextElementSibling.classList.remove('placeholder-color-focused');

        console.log(e.target.value)
        if (!e.target.value) {
            e.target.nextElementSibling.classList.remove('focused');
        }
    })
}