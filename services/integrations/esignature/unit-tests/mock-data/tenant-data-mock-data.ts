export const directClientTenantId = '40819cd7-7892-4172-b1cd-9bf64d3fe585';
export const indirectClientTenantId = '33a01e97-e4d8-4900-9e6f-9b7eb23c6516';
export const nonExistentTenantId = '018bc8d5-4706-4b73-868b-49508d7e6eed';

export const directClientPricingData = JSON.stringify({
    monthlyCost: '10.00',
    costPerRequest: '1.00',
});

export const indirectClientPricingData = JSON.stringify({
    monthlyCost: '6.00',
    costPerRequest: '0.55',
});

export const legacyClientCutOffDate = '10/22/2020';

export const directClientResponse = {
    isDirectClient: true,
    pricingData: JSON.parse(directClientPricingData),
};

export const indirectClientResponse = {
    isDirectClient: false,
    pricingData: JSON.parse(indirectClientPricingData),
};