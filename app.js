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

//Getting elements used in remote region calculation
const remoteRegionFullSnapshotSize = document.getElementById('remote-region-full-snapshot-size');
const remoteRegionIncrementalStorageSize = document.getElementById('remote-region-incremental-storage-size')
const remoteRegionRetentionCopies = document.getElementById('remote-region-retention-copies-incremental-storage-size');
const remoteRegionStorageSize = document.getElementById('remote-region-storage-size');
const remoteRegionSnapshotStorageCost = document.getElementById('remote-region-snapshot-storage-cost');
const remoteRegionIngressNetworkCost = document.getElementById('remote-region-ingress-network-cost');
const remoteRegionTotalCost = document.getElementById('remote-region-totalcost');

//Variables used to store the values of base inputs to proceed further 
let totalEbsVolumeSizeValue = 0;
let ebsChangeRateValue = 0;
let protectionIntervalValue = 0;
let primaryRetentionCopiesValue = 0;
let remoteRetentionCopiesValue = 0;
let totalProtectionPerMonthValue = 0;
let primaryRegionValue = '';
let remoteRegionValue = '';

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
    if (number == '' || number == NaN || number == undefined)
        return 0
    else
        return parseFloat(number)
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
    remoteRegionValue =  remoteRegion.value;
};


function changeEventHandler(event) {
    //Gets the  current value in input field given by user 
    renderAllValues();          
    totalProtectionPerMonthValue = calculateTotalProtectionPerMonth(protectionIntervalValue, primaryRetentionCopiesValue); 
    totalProtectionPerMonth.value = totalProtectionPerMonthValue;
    //Calculate the Required values in primary region
    primaryRegioncalulation();   
    //Calculate the Required values in primary region
    remoteRegionCalculation(); 
    //Updates the calculated values in DOM for Primary region
    updatePrimaryRegionValues(); 
    //Updates the calculated values in DOM for remote region
    updateRemoteRegionValues();  
    //Update the general values
    updateGeneralCost();
};


function updateGeneralCost() {   
    primaryRegionLocalProtection.value = (primaryRegionCalculatedValues.snapshotCost);
    remoteRegionStorageCost.value =  (remoteRegionCalculatedValues.snapshotStorageCost);
    interRegionDataTransferCost.value = (primaryRegionCalculatedValues.egressNetworkCost);
    overallTotalCost.value = (calculateOverallValues(primaryRegionCalculatedValues.snapshotCost,
        remoteRegionCalculatedValues.snapshotStorageCost,
        primaryRegionCalculatedValues.egressNetworkCost));                                      
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
        calculateRegionSnapshotCost(primaryRegionCalculatedValues.snapshotStorageSize, 0.0500);
    primaryRegionCalculatedValues.egressNetworkCost =
        calculateRegionNetworkCost(totalProtectionPerMonthValue, 0.0100, primaryRegionCalculatedValues.retentionCopies);
    primaryRegionCalculatedValues.totalCost =
        calculateRegionTotalCost(primaryRegionCalculatedValues.snapshotCost, primaryRegionCalculatedValues.egressNetworkCost);
};


function remoteRegionCalculation() {
    remoteRegionCalculatedValues.fullSnapshotStorageSize =  primaryRegionCalculatedValues.firstSnapshotStorageSize;
    remoteRegionCalculatedValues.incrementalStorageSize = primaryRegionCalculatedValues.ebsChangeBetweenProtection;
    remoteRegionCalculatedValues.retentionCopies =
        calculateRetentionCopiesWithIncrementalSize(remoteRegionCalculatedValues.incrementalStorageSize, remoteRetentionCopiesValue);
    remoteRegionCalculatedValues.snapshotStorageSize =
        calculateRegionSnapshotStorageSize(remoteRegionCalculatedValues.fullSnapshotStorageSize, remoteRegionCalculatedValues.retentionCopies);
    remoteRegionCalculatedValues.snapshotStorageCost =
      (calculateRegionSnapshotCost(remoteRegionCalculatedValues.snapshotStorageSize, 0.0550));
    remoteRegionCalculatedValues.ingressNetworkcost =
       calculateRegionNetworkCost(totalProtectionPerMonthValue, 0, remoteRegionCalculatedValues.retentionCopies);
    remoteRegionCalculatedValues.totalCost =
      (calculateRegionTotalCost(remoteRegionCalculatedValues.snapshotStorageCost, remoteRegionCalculatedValues.ingressNetworkcost));
}


function updatePrimaryRegionValues() {
    primaryRegionEbsVolumeSize.value = primaryRegionCalculatedValues.totalEbsVolumeSizeInGb;
    primaryRegionEbsChangeBetweenProtections.value = primaryRegionCalculatedValues.ebsChangeBetweenProtection;
    primaryRegionFirstSnapshotSize.value = primaryRegionCalculatedValues.firstSnapshotStorageSize;
    primaryRegionRetentionCopies.value = primaryRegionCalculatedValues.retentionCopies
    primaryRegionSnapshotStorageSize.value = primaryRegionCalculatedValues.snapshotStorageSize;
    primaryRegionSnapShotCost.value = (primaryRegionCalculatedValues.snapshotCost);
    primaryRegionEgressNetworkCost.value = (primaryRegionCalculatedValues.egressNetworkCost);
    primaryRegionTotalCost.value = (primaryRegionCalculatedValues.totalCost);
}


function updateRemoteRegionValues() {
    remoteRegionFullSnapshotSize.value = remoteRegionCalculatedValues.fullSnapshotStorageSize;
    remoteRegionIncrementalStorageSize.value = remoteRegionCalculatedValues.incrementalStorageSize;
    remoteRegionRetentionCopies.value = remoteRegionCalculatedValues.retentionCopies;
    remoteRegionStorageSize.value = remoteRegionCalculatedValues.snapshotStorageSize;
    remoteRegionSnapshotStorageCost.value = (remoteRegionCalculatedValues.snapshotStorageCost);
    remoteRegionIngressNetworkCost.value = (remoteRegionCalculatedValues.ingressNetworkcost);
    remoteRegionTotalCost.value =  (remoteRegionCalculatedValues.totalCost);
}


function calculateTotalProtectionPerMonth(protectionIntervalValue, primaryRetentionCopies) {
    return formatNumberPrecision(protectionIntervalValue * primaryRetentionCopies * 30);
}


function calculateTotalEbsVolumeInGb(totalEbsVolumeSizeValue) {
    return formatNumberPrecision(totalEbsVolumeSizeValue * 1000);
}


function calculateEbsChangebetweenProtection(totalEbsVolumeSizeInGb,ebschangeRateValue) {
    return formatNumberPrecision(totalEbsVolumeSizeInGb * ebsChangeRateValue / 100);
}


function calculateRetentionCopiesWithIncrementalSize(retentionCopiesValue, ebsChangeBetweenProtection) {
    return formatNumberPrecision(retentionCopiesValue * ebsChangeBetweenProtection);
}


function calculateRegionSnapshotStorageSize(firstSnapshotStorageSize, retentionCopiesWithIncrementalSize) {
    return formatNumberPrecision(firstSnapshotStorageSize + retentionCopiesWithIncrementalSize);
}


function calculateRegionSnapshotCost(snapshotStorageSize, regionalCost) {
    return formatNumberPrecision(snapshotStorageSize * regionalCost);
}


function calculateRegionNetworkCost(totalProtectionPerMonth, regionalCost, retentionCopies) {
    return formatNumberPrecision(totalProtectionPerMonth * regionalCost * retentionCopies);
}


function calculateRegionTotalCost(snapshotCost, networkCost) {
    return formatNumberPrecision(snapshotCost + networkCost);
}

function calculateOverallValues(primaryRegionSnapshotCost, remoteRegionSnapshotCost, primaryNetworkCost) {
    return formatNumberPrecision(primaryRegionSnapshotCost + remoteRegionSnapshotCost + primaryNetworkCost);
}


//Adds the event to the dropdowns 
primaryRegion.addEventListener('change', changeEventHandler);
remoteRegion.addEventListener("change", changeEventHandler);

//Adds the event to the base input fields
for (let inputElement of allInputFields) {
    inputElement.addEventListener('change', changeEventHandler);

    inputElement.addEventListener('focus', (e) => {
        e.target.parentElement.classList.add('add-style-onfocus');
    })

    inputElement.addEventListener('blur', (e) => {
        e.target.parentElement.classList.remove('add-style-onfocus');
    })
}

