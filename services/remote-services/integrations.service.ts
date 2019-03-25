export type EsignatureAppInfo = {
    id: string;
};

export async function getEsignatureAppByCompany(tenantId: string, companyId: string): Promise<EsignatureAppInfo> {
    console.info('integrationsService.getEsignatureAppByCompany');

    // TODO: Add API call to integrations to retrieve app id in MJ-1794. For now, just hardcode information.
    console.log(`tenantId: ${tenantId}`, `companyId ${companyId}`);

    return {
        id: '60993c2a7f523b7d0035c0f81b1f8f48',
    };
}
