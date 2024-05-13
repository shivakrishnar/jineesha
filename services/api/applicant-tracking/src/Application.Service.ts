import * as errorService from '../../../errors/error.service';
import * as utilService from '../../../util.service';
import * as paginationService from '../../../pagination/pagination.service';
import * as atInterfaces from './ApplicantTracking.Interfaces';
import { ErrorMessage } from '../../../errors/errorMessage';
import { ParameterizedQuery } from '../../../queries/parameterizedQuery';
import { Queries } from '../../../queries/queries';
import { DatabaseEvent, QueryType } from '../../../internal-api/database/events';
import { PaginatedResult } from '../../../pagination/paginatedResult';
import { AuditActionType, AuditAreaOfChange, IAudit } from '../../../internal-api/audit/audit';
import { v4 as uuid }  from 'uuid';

/**
 * Returns a list of ATApplication by company.
 */
export async function getApplicationByCompany(
    tenantId: string,
    companyId: string,
    queryParams: any,
    domainName: string,
    path: string,
): Promise<PaginatedResult> {
    console.info('Application.Service.getApplicationByCompany');

    const validQueryStringParameters = ['pageToken', 'searchBy'];
    utilService.validateQueryParams(queryParams, validQueryStringParameters);
    const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

    const companyIds = companyId.split("-");
    companyIds.forEach(id => {
        if (Number.isNaN(Number(id))) {
            const errorMessage = `${id} is not a valid number`;
            throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
        }
    });

    try {
        const query = new ParameterizedQuery('getApplicationByCompany', Queries.getApplicationByCompany);
        query.setStringParameter('@CompanyID', companyId);

        const paginatedQuery = await paginationService.appendPaginationFilter(query, page);
        const payload = { 
            tenantId, 
            queryName: paginatedQuery.name, 
            query: paginatedQuery.value, 
            queryType: QueryType.Simple 
        } as DatabaseEvent;

        const dbResults: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);
        const totalCount = dbResults.recordsets[0][0].totalCount;
        const results: atInterfaces.IApplicationGET[] = dbResults.recordsets[1];
        return await paginationService.createPaginatedResult(results, baseUrl, totalCount, page);
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }
        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Returns a list of ATApplication by Key.
 */
export async function getApplicationByKey(
    tenantId: string,
    applicationKey: string
): Promise<atInterfaces.IApplicationGET> {
    console.info('Application.Service.getApplicationByKey');

    //
    // getting data
    //
    try {
        const query = new ParameterizedQuery('getApplicationByKey', Queries.getApplicationByKey);
        query.setStringParameter('@ATApplicationKey', applicationKey);

        const payload = { 
            tenantId, 
            queryName: query.name, 
            query: query.value, 
            queryType: QueryType.Simple 
        } as DatabaseEvent;

        const dbResults: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);
        if (dbResults && dbResults.recordset && dbResults.recordset.length == 1) {
            const result: atInterfaces.IApplicationGET = dbResults.recordset[0];
            return result;
        }
        else {
            return dbResults.recordset;
        }
        
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }
        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Create ATApplication.
 */
export async function createApplication(
    tenantId: string,
    userEmail: string,
    requestBody: atInterfaces.IApplicationPOST
): Promise<atInterfaces.IApplicationGET> {
    console.info('Application.Service.createApplication');

    try {

        const atApplicationKey = uuid().toUpperCase();

        //
        // inserting data
        //
        const query = new ParameterizedQuery('createApplication', Queries.createApplication);

        query.setValueOrNullParameter('@ATSoftStatusTypeID', requestBody.atSoftStatusTypeId);
        query.setStringOrNullParameter('@ATApplicationKey', atApplicationKey);
        query.setValueOrNullParameter('@ReceivedDate', requestBody.receivedDate);
        query.setStringOrNullParameter('@FirstName', requestBody.firstName);
        query.setStringOrNullParameter('@MiddleName', requestBody.middleName);
        query.setStringOrNullParameter('@LastName', requestBody.lastName);
        query.setStringOrNullParameter('@Address1', requestBody.address1);
        query.setStringOrNullParameter('@Address2', requestBody.address2);
        query.setStringOrNullParameter('@City', requestBody.city);
        query.setStringOrNullParameter('@Zip', requestBody.zip);
        query.setValueOrNullParameter('@CountryStateTypeID', requestBody.countryStateTypeId);
        query.setStringOrNullParameter('@EmailAddress', requestBody.emailAddress);
        query.setStringOrNullParameter('@PhoneHome', requestBody.phoneHome);
        query.setStringOrNullParameter('@PhoneCell', requestBody.phoneCell);
        query.setValueOrNullParameter('@BirthDate', requestBody.birthDate);
        query.setStringOrNullParameter('@SSN', requestBody.ssn);
        query.setStringOrNullParameter('@AlternateTaxNumber', requestBody.alternateTaxNumber);
        query.setStringOrNullParameter('@PreviousAddress', requestBody.previousAddress);
        query.setStringOrNullParameter('@LengthAtCurrentAddress', requestBody.lengthAtCurrentAddress);
        
        query.setBooleanParameter('@PreviousEmployer1MayWeContact', requestBody.previousEmployer1MayWeContact);
        query.setStringOrNullParameter('@PreviousEmployer1CompanyName', requestBody.previousEmployer1CompanyName);
        query.setStringOrNullParameter('@PreviousEmployer1Address', requestBody.previousEmployer1Address);
        query.setStringOrNullParameter('@PreviousEmployer1City', requestBody.previousEmployer1City);
        query.setValueOrNullParameter('@PreviousEmployer1CountryStateTypeID', requestBody.previousEmployer1CountryStateTypeId);
        query.setStringOrNullParameter('@PreviousEmployer1Phone', requestBody.previousEmployer1Phone);
        query.setStringOrNullParameter('@PreviousEmployer1SupervisorName', requestBody.previousEmployer1SupervisorName);
        query.setStringOrNullParameter('@PreviousEmployer1SupervisorTitle', requestBody.previousEmployer1Title);
        query.setStringOrNullParameter('@PreviousEmployer1Duties', requestBody.previousEmployer1Duties);
        query.setStringOrNullParameter('@PreviousEmployer1LeavingReasons', requestBody.previousEmployer1LeavingReasons);
        query.setValueOrNullParameter('@PreviousEmployer1StartingPay', requestBody.previousEmployer1StartingPay);
        query.setValueOrNullParameter('@PreviousEmployer1EndingPay', requestBody.previousEmployer1EndingPay);
        query.setValueOrNullParameter('@PreviousEmployer1StartDate', requestBody.previousEmployer1StartDate);
        query.setValueOrNullParameter('@PreviousEmployer1EndDate', requestBody.previousEmployer1EndDate);
              
        query.setBooleanParameter('@PreviousEmployer2MayWeContact', requestBody.previousEmployer2MayWeContact);
        query.setStringOrNullParameter('@PreviousEmployer2CompanyName', requestBody.previousEmployer2CompanyName);
        query.setStringOrNullParameter('@PreviousEmployer2Address', requestBody.previousEmployer2Address);
        query.setStringOrNullParameter('@PreviousEmployer2City', requestBody.previousEmployer2City);
        query.setValueOrNullParameter('@PreviousEmployer2CountryStateTypeID', requestBody.previousEmployer2CountryStateTypeId);
        query.setStringOrNullParameter('@PreviousEmployer2Phone', requestBody.previousEmployer2Phone);
        query.setStringOrNullParameter('@PreviousEmployer2SupervisorName', requestBody.previousEmployer2SupervisorName);
        query.setStringOrNullParameter('@PreviousEmployer2SupervisorTitle', requestBody.previousEmployer2Title);
        query.setStringOrNullParameter('@PreviousEmployer2Duties', requestBody.previousEmployer2Duties);
        query.setStringOrNullParameter('@PreviousEmployer2LeavingReasons', requestBody.previousEmployer2LeavingReasons);
        query.setValueOrNullParameter('@PreviousEmployer2StartingPay', requestBody.previousEmployer2StartingPay);
        query.setValueOrNullParameter('@PreviousEmployer2EndingPay', requestBody.previousEmployer2EndingPay);
        query.setValueOrNullParameter('@PreviousEmployer2StartDate', requestBody.previousEmployer2StartDate);
        query.setValueOrNullParameter('@PreviousEmployer2EndDate', requestBody.previousEmployer2EndDate);
        
        query.setBooleanParameter('@PreviousEmployer3MayWeContact', requestBody.previousEmployer3MayWeContact);
        query.setStringOrNullParameter('@PreviousEmployer3CompanyName', requestBody.previousEmployer3CompanyName);
        query.setStringOrNullParameter('@PreviousEmployer3Address', requestBody.previousEmployer3Address);
        query.setStringOrNullParameter('@PreviousEmployer3City', requestBody.previousEmployer3City);
        query.setValueOrNullParameter('@PreviousEmployer3CountryStateTypeID', requestBody.previousEmployer3CountryStateTypeId);
        query.setStringOrNullParameter('@PreviousEmployer3Phone', requestBody.previousEmployer3Phone);
        query.setStringOrNullParameter('@PreviousEmployer3SupervisorName', requestBody.previousEmployer3SupervisorName);
        query.setStringOrNullParameter('@PreviousEmployer3SupervisorTitle', requestBody.previousEmployer3Title);
        query.setStringOrNullParameter('@PreviousEmployer3Duties', requestBody.previousEmployer3Duties);
        query.setStringOrNullParameter('@PreviousEmployer3LeavingReasons', requestBody.previousEmployer3LeavingReasons);
        query.setValueOrNullParameter('@PreviousEmployer3StartingPay', requestBody.previousEmployer3StartingPay);
        query.setValueOrNullParameter('@PreviousEmployer3EndingPay', requestBody.previousEmployer3EndingPay);       
        query.setValueOrNullParameter('@PreviousEmployer3StartDate', requestBody.previousEmployer2StartDate);
        query.setValueOrNullParameter('@PreviousEmployer3EndDate', requestBody.previousEmployer2EndDate);
        
        query.setBooleanParameter('@WorkHistoryConditionsThatLimitAbility', requestBody.workHistoryConditionsThatLimitAbility);
        query.setStringOrNullParameter('@WorkHistoryConditionsHowCanWeAccommodate', requestBody.workHistoryConditionsHowCanWeAccommodate);
        query.setBooleanParameter('@WorkHistoryUSLegal', requestBody.workHistoryUSLegal);
        query.setBooleanParameter('@WorkHistoryConvictedOfFelony', requestBody.workHistoryConvictedOfFelony);
        query.setStringOrNullParameter('@WorkHistoryConvictedOfFelonyReasons', requestBody.workHistoryConvictedOfFelonyReasons);
        
        query.setValueOrNullParameter('@EducationHistory1EducationLevelTypeID', requestBody.educationHistory1EducationLevelTypeId);
        query.setStringOrNullParameter('@EducationHistory1Institution', requestBody.educationHistory1Institution);
        query.setStringOrNullParameter('@EducationHistory1Major', requestBody.educationHistory1Major);
        query.setStringOrNullParameter('@EducationHistory1Minor', requestBody.educationHistory1Minor);
        query.setValueOrNullParameter('@EducationHistory1CompletedDate', requestBody.educationHistory1CompletedDate);
        
        query.setValueOrNullParameter('@EducationHistory2EducationLevelTypeID', requestBody.educationHistory2EducationLevelTypeId);
        query.setStringOrNullParameter('@EducationHistory2Institution', requestBody.educationHistory2Institution);
        query.setStringOrNullParameter('@EducationHistory2Major', requestBody.educationHistory2Major);
        query.setStringOrNullParameter('@EducationHistory2Minor', requestBody.educationHistory2Minor);
        query.setValueOrNullParameter('@EducationHistory2CompletedDate', requestBody.educationHistory2CompletedDate);
        
        query.setValueOrNullParameter('@EducationHistory3EducationLevelTypeID', requestBody.educationHistory3EducationLevelTypeId);
        query.setStringOrNullParameter('@EducationHistory3Institution', requestBody.educationHistory3Institution);
        query.setStringOrNullParameter('@EducationHistory3Major', requestBody.educationHistory3Major);
        query.setStringOrNullParameter('@EducationHistory3Minor', requestBody.educationHistory3Minor);
        query.setValueOrNullParameter('@EducationHistory3CompletedDate', requestBody.educationHistory3CompletedDate);
        
        query.setBooleanParameter('@ICertifyStatement', requestBody.iCertifyStatement);
        query.setStringOrNullParameter('@KeywordList', requestBody.keywordList);
        query.setValueOrNullParameter('@Rating', requestBody.rating);
        query.setBooleanParameter('@Archived', requestBody.archived);
        query.setValueOrNullParameter('@ATJobPostingID', requestBody.atJobPostingId);
        query.setStringOrNullParameter('@EsignName', requestBody.esignName);
        query.setValueOrNullParameter('@EsignStamptedDateTime', requestBody.eSignStamptedDateTime);
        query.setStringOrNullParameter('@FormMakeOffer', requestBody.formMakeOffer);

        query.setBooleanParameter('@IsWorkflowOfferAccepted', requestBody.isWorkflowOfferAccepted);
        query.setBooleanParameter('@IsWorkflowOfferRejected', requestBody.isWorkflowOfferRejected);
        query.setStringOrNullParameter('@EsignNameOffer', requestBody.eSignNameOffer);
        query.setValueOrNullParameter('@EsignStamptedDateTimeOffer', requestBody.eSignStamptedDateTimeOffer);
        query.setStringOrNullParameter('@ReferralSource', requestBody.referralSource);
        query.setStringOrNullParameter('@FormRejectApplication', requestBody.formRejectApplication);
        query.setBooleanParameter('@IsVetStatus_Disabled', requestBody.isVetStatus_Disabled);
        query.setBooleanParameter('@IsVetStatus_RecentlySeparated', requestBody.isVetStatus_RecentlySeparated);
        query.setBooleanParameter('@IsVetStatus_ActiveDutyWartime', requestBody.isVetStatus_ActiveDutyWartime);
        query.setBooleanParameter('@IsVetStatus_AFServiceMedal', requestBody.isVetStatus_AFServiceMedal);

        query.setValueOrNullParameter('@VetStatus_DischargeDate', requestBody.vetStatus_DischargeDate);
        query.setStringOrNullParameter('@VetStatus_MilitaryReserve', requestBody.vetStatus_MilitaryReserve);
        query.setStringOrNullParameter('@VetStatus_Veteran', requestBody.vetStatus_Veteran);
        query.setBooleanParameter('@IsVetStatus_VietnamEra', requestBody.isVetStatus_VietnamEra);
        query.setBooleanParameter('@IsVetStatus_Other', requestBody.isVetStatus_Other);
        query.setValueOrNullParameter('@ExternalCandidateID', requestBody.externalCandidateId);
        query.setStringOrNullParameter('@ExternalSystem', requestBody.externalSystem);
        
        query.setStringOrNullParameter('@Gender', requestBody.gender);
        query.setValueOrNullParameter('@ApplyDate', requestBody.applyDate);
        query.setStringOrNullParameter('@SchemeID', requestBody.schemeId);
        query.setStringOrNullParameter('@SchemeAgencyID', requestBody.schemeAgencyId);
        query.setValueOrNullParameter('@PositionOpeningID', requestBody.positionOpeningId);
        query.setStringOrNullParameter('@PositionSchemeID', requestBody.positionSchemeId);
        query.setStringOrNullParameter('@PositionAgencyID', requestBody.positionAgencyId);
        query.setStringOrNullParameter('@PositionUri', requestBody.positionUri);
        query.setStringOrNullParameter('@Status', requestBody.status);
        
        query.setStringOrNullParameter('@StatusCategory', requestBody.statusCategory);
        query.setValueOrNullParameter('@StatusTransitionDateTime', requestBody.statusTransitionDateTime);
        query.setStringOrNullParameter('@EducationLevelCode', requestBody.educationLevelCode);
        query.setStringOrNullParameter('@Citizenship', requestBody.citizenship);
        query.setStringOrNullParameter('@RequestJSON', requestBody.requestJSON);
        query.setValueOrNullParameter('@DateAdded', requestBody.dateAdded);
        query.setValueOrNullParameter('@ProfileID', requestBody.profileId);
        query.setStringOrNullParameter('@PreviousEmployer1Title', requestBody.previousEmployer1Title);
        query.setStringOrNullParameter('@PreviousEmployer2Title', requestBody.previousEmployer2Title);
        query.setStringOrNullParameter('@PreviousEmployer3Title', requestBody.previousEmployer3Title);
        
        const payload = { 
            tenantId, 
            queryName: query.name, 
            query: query.value, 
            queryType: QueryType.Simple 
        } as DatabaseEvent;

        const queryResult: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);
        const id: any = queryResult.recordset[0].ID;
        if (id) {
            //
            // getting data
            //
            const apiresult = await getApplicationByKey(tenantId, atApplicationKey);

            //
            // auditing log
            //
            const logResult = { ...apiresult };

            for (const key  in logResult) {
                if (typeof logResult[key] === 'string') {
                    logResult[key] = utilService.sanitizeStringForSql(logResult[key]);
                }
            }

            utilService.logToAuditTrail({
                userEmail,
                newFields: logResult,
                type: AuditActionType.Insert,
                companyId: '',
                areaOfChange: AuditAreaOfChange.ApplicantTracking,
                tenantId,
            } as IAudit);

            //
            // api response
            //

            //Notification

            return apiresult;
        } else {
            throw errorService.getErrorResponse(74).setDeveloperMessage('Was not possible to create the resource');
        }
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }
        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Update ATApplication.
 */
export async function updateApplication(
    tenantId: string,
    userEmail: string,
    requestBody: atInterfaces.IApplicationPUT
): Promise<Boolean> {
    console.info('Application.Service.updateApplication');

    try {
        //
        // getting the old values for audit log
        //
        const oldValues = await getApplicationByKey(tenantId, requestBody.atApplicationKey);
        if (!oldValues) {
            throw errorService.getErrorResponse(50);
        }
       
        //
        // updating data
        //
        const query = new ParameterizedQuery('updateApplication', Queries.updateApplication);
        
        query.setValueOrNullParameter('@ATSoftStatusTypeID', requestBody.atSoftStatusTypeId);
        query.setStringParameter('@ATApplicationKey', requestBody.atApplicationKey);
        query.setValueOrNullParameter('@ReceivedDate', requestBody.receivedDate);
        query.setStringOrNullParameter('@FirstName', requestBody.firstName);
        query.setStringOrNullParameter('@MiddleName', requestBody.middleName);
        query.setStringOrNullParameter('@LastName', requestBody.lastName);
        query.setStringOrNullParameter('@Address1', requestBody.address1);
        query.setStringOrNullParameter('@Address2', requestBody.address2);
        query.setStringOrNullParameter('@City', requestBody.city);
        query.setStringOrNullParameter('@Zip', requestBody.zip);
        query.setValueOrNullParameter('@CountryStateTypeID', requestBody.countryStateTypeId);
        query.setStringOrNullParameter('@EmailAddress', requestBody.emailAddress);
        query.setStringOrNullParameter('@PhoneHome', requestBody.phoneHome);
        query.setStringOrNullParameter('@PhoneCell', requestBody.phoneCell);
        query.setValueOrNullParameter('@BirthDate', requestBody.birthDate);
        query.setStringOrNullParameter('@SSN', requestBody.ssn);
        query.setStringOrNullParameter('@AlternateTaxNumber', requestBody.alternateTaxNumber);
        query.setStringOrNullParameter('@PreviousAddress', requestBody.previousAddress);
        query.setStringOrNullParameter('@LengthAtCurrentAddress', requestBody.lengthAtCurrentAddress);
        
        query.setBooleanParameter('@PreviousEmployer1MayWeContact', requestBody.previousEmployer1MayWeContact);
        query.setStringOrNullParameter('@PreviousEmployer1CompanyName', requestBody.previousEmployer1CompanyName);
        query.setStringOrNullParameter('@PreviousEmployer1Address', requestBody.previousEmployer1Address);
        query.setStringOrNullParameter('@PreviousEmployer1City', requestBody.previousEmployer1City);
        query.setValueOrNullParameter('@PreviousEmployer1CountryStateTypeID', requestBody.previousEmployer1CountryStateTypeId);
        query.setStringOrNullParameter('@PreviousEmployer1Phone', requestBody.previousEmployer1Phone);
        query.setStringOrNullParameter('@PreviousEmployer1SupervisorName', requestBody.previousEmployer1SupervisorName);
        query.setStringOrNullParameter('@PreviousEmployer1SupervisorTitle', requestBody.previousEmployer1Title);
        query.setStringOrNullParameter('@PreviousEmployer1Duties', requestBody.previousEmployer1Duties);
        query.setStringOrNullParameter('@PreviousEmployer1LeavingReasons', requestBody.previousEmployer1LeavingReasons);
        query.setValueOrNullParameter('@PreviousEmployer1StartingPay', requestBody.previousEmployer1StartingPay);
        query.setValueOrNullParameter('@PreviousEmployer1EndingPay', requestBody.previousEmployer1EndingPay);
        query.setValueOrNullParameter('@PreviousEmployer1StartDate', requestBody.previousEmployer1StartDate);
        query.setValueOrNullParameter('@PreviousEmployer1EndDate', requestBody.previousEmployer1EndDate);
              
        query.setBooleanParameter('@PreviousEmployer2MayWeContact', requestBody.previousEmployer2MayWeContact);
        query.setStringOrNullParameter('@PreviousEmployer2CompanyName', requestBody.previousEmployer2CompanyName);
        query.setStringOrNullParameter('@PreviousEmployer2Address', requestBody.previousEmployer2Address);
        query.setStringOrNullParameter('@PreviousEmployer2City', requestBody.previousEmployer2City);
        query.setValueOrNullParameter('@PreviousEmployer2CountryStateTypeID', requestBody.previousEmployer2CountryStateTypeId);
        query.setStringOrNullParameter('@PreviousEmployer2Phone', requestBody.previousEmployer2Phone);
        query.setStringOrNullParameter('@PreviousEmployer2SupervisorName', requestBody.previousEmployer2SupervisorName);
        query.setStringOrNullParameter('@PreviousEmployer2SupervisorTitle', requestBody.previousEmployer2Title);
        query.setStringOrNullParameter('@PreviousEmployer2Duties', requestBody.previousEmployer2Duties);
        query.setStringOrNullParameter('@PreviousEmployer2LeavingReasons', requestBody.previousEmployer2LeavingReasons);
        query.setValueOrNullParameter('@PreviousEmployer2StartingPay', requestBody.previousEmployer2StartingPay);
        query.setValueOrNullParameter('@PreviousEmployer2EndingPay', requestBody.previousEmployer2EndingPay);
        query.setValueOrNullParameter('@PreviousEmployer2StartDate', requestBody.previousEmployer2StartDate);
        query.setValueOrNullParameter('@PreviousEmployer2EndDate', requestBody.previousEmployer2EndDate);
        
        query.setBooleanParameter('@PreviousEmployer3MayWeContact', requestBody.previousEmployer3MayWeContact);
        query.setStringOrNullParameter('@PreviousEmployer3CompanyName', requestBody.previousEmployer3CompanyName);
        query.setStringOrNullParameter('@PreviousEmployer3Address', requestBody.previousEmployer3Address);
        query.setStringOrNullParameter('@PreviousEmployer3City', requestBody.previousEmployer3City);
        query.setValueOrNullParameter('@PreviousEmployer3CountryStateTypeID', requestBody.previousEmployer3CountryStateTypeId);
        query.setStringOrNullParameter('@PreviousEmployer3Phone', requestBody.previousEmployer3Phone);
        query.setStringOrNullParameter('@PreviousEmployer3SupervisorName', requestBody.previousEmployer3SupervisorName);
        query.setStringOrNullParameter('@PreviousEmployer3SupervisorTitle', requestBody.previousEmployer3Title);
        query.setStringOrNullParameter('@PreviousEmployer3Duties', requestBody.previousEmployer3Duties);
        query.setStringOrNullParameter('@PreviousEmployer3LeavingReasons', requestBody.previousEmployer3LeavingReasons);
        query.setValueOrNullParameter('@PreviousEmployer3StartingPay', requestBody.previousEmployer3StartingPay);
        query.setValueOrNullParameter('@PreviousEmployer3EndingPay', requestBody.previousEmployer3EndingPay);       
        query.setValueOrNullParameter('@PreviousEmployer3StartDate', requestBody.previousEmployer2StartDate);
        query.setValueOrNullParameter('@PreviousEmployer3EndDate', requestBody.previousEmployer2EndDate);
        
        query.setBooleanParameter('@WorkHistoryConditionsThatLimitAbility', requestBody.workHistoryConditionsThatLimitAbility);
        query.setStringOrNullParameter('@WorkHistoryConditionsHowCanWeAccommodate', requestBody.workHistoryConditionsHowCanWeAccommodate);
        query.setBooleanParameter('@WorkHistoryUSLegal', requestBody.workHistoryUSLegal);
        query.setBooleanParameter('@WorkHistoryConvictedOfFelony', requestBody.workHistoryConvictedOfFelony);
        query.setStringOrNullParameter('@WorkHistoryConvictedOfFelonyReasons', requestBody.workHistoryConvictedOfFelonyReasons);
        
        query.setValueOrNullParameter('@EducationHistory1EducationLevelTypeID', requestBody.educationHistory1EducationLevelTypeId);
        query.setStringOrNullParameter('@EducationHistory1Institution', requestBody.educationHistory1Institution);
        query.setStringOrNullParameter('@EducationHistory1Major', requestBody.educationHistory1Major);
        query.setStringOrNullParameter('@EducationHistory1Minor', requestBody.educationHistory1Minor);
        query.setValueOrNullParameter('@EducationHistory1CompletedDate', requestBody.educationHistory1CompletedDate);
        
        query.setValueOrNullParameter('@EducationHistory2EducationLevelTypeID', requestBody.educationHistory2EducationLevelTypeId);
        query.setStringOrNullParameter('@EducationHistory2Institution', requestBody.educationHistory2Institution);
        query.setStringOrNullParameter('@EducationHistory2Major', requestBody.educationHistory2Major);
        query.setStringOrNullParameter('@EducationHistory2Minor', requestBody.educationHistory2Minor);
        query.setValueOrNullParameter('@EducationHistory2CompletedDate', requestBody.educationHistory2CompletedDate);
        
        query.setValueOrNullParameter('@EducationHistory3EducationLevelTypeID', requestBody.educationHistory3EducationLevelTypeId);
        query.setStringOrNullParameter('@EducationHistory3Institution', requestBody.educationHistory3Institution);
        query.setStringOrNullParameter('@EducationHistory3Major', requestBody.educationHistory3Major);
        query.setStringOrNullParameter('@EducationHistory3Minor', requestBody.educationHistory3Minor);
        query.setValueOrNullParameter('@EducationHistory3CompletedDate', requestBody.educationHistory3CompletedDate);
        
        query.setBooleanParameter('@ICertifyStatement', requestBody.iCertifyStatement);
        query.setStringOrNullParameter('@KeywordList', requestBody.keywordList);
        query.setValueOrNullParameter('@Rating', requestBody.rating);
        query.setBooleanParameter('@Archived', requestBody.archived);
        query.setValueOrNullParameter('@ATJobPostingID', requestBody.atJobPostingId);
        query.setStringOrNullParameter('@EsignName', requestBody.esignName);
        query.setValueOrNullParameter('@EsignStamptedDateTime', requestBody.eSignStamptedDateTime);
        query.setStringOrNullParameter('@FormMakeOffer', requestBody.formMakeOffer);

        query.setBooleanParameter('@IsWorkflowOfferAccepted', requestBody.isWorkflowOfferAccepted);
        query.setBooleanParameter('@IsWorkflowOfferRejected', requestBody.isWorkflowOfferRejected);
        query.setStringOrNullParameter('@EsignNameOffer', requestBody.eSignNameOffer);
        query.setValueOrNullParameter('@EsignStamptedDateTimeOffer', requestBody.eSignStamptedDateTimeOffer);
        query.setStringOrNullParameter('@ReferralSource', requestBody.referralSource);
        query.setStringOrNullParameter('@FormRejectApplication', requestBody.formRejectApplication);
        query.setBooleanParameter('@IsVetStatus_Disabled', requestBody.isVetStatus_Disabled);
        query.setBooleanParameter('@IsVetStatus_RecentlySeparated', requestBody.isVetStatus_RecentlySeparated);
        query.setBooleanParameter('@IsVetStatus_ActiveDutyWartime', requestBody.isVetStatus_ActiveDutyWartime);
        query.setBooleanParameter('@IsVetStatus_AFServiceMedal', requestBody.isVetStatus_AFServiceMedal);

        query.setValueOrNullParameter('@VetStatus_DischargeDate', requestBody.vetStatus_DischargeDate);
        query.setStringOrNullParameter('@VetStatus_MilitaryReserve', requestBody.vetStatus_MilitaryReserve);
        query.setStringOrNullParameter('@VetStatus_Veteran', requestBody.vetStatus_Veteran);
        query.setBooleanParameter('@IsVetStatus_VietnamEra', requestBody.isVetStatus_VietnamEra);
        query.setBooleanParameter('@IsVetStatus_Other', requestBody.isVetStatus_Other);
        query.setValueOrNullParameter('@ExternalCandidateID', requestBody.externalCandidateId);
        query.setStringOrNullParameter('@ExternalSystem', requestBody.externalSystem);
        
        query.setStringOrNullParameter('@Gender', requestBody.gender);
        query.setValueOrNullParameter('@ApplyDate', requestBody.applyDate);
        query.setStringOrNullParameter('@SchemeID', requestBody.schemeId);
        query.setStringOrNullParameter('@SchemeAgencyID', requestBody.schemeAgencyId);
        query.setValueOrNullParameter('@PositionOpeningID', requestBody.positionOpeningId);
        query.setStringOrNullParameter('@PositionSchemeID', requestBody.positionSchemeId);
        query.setStringOrNullParameter('@PositionAgencyID', requestBody.positionAgencyId);
        query.setStringOrNullParameter('@PositionUri', requestBody.positionUri);
        query.setStringOrNullParameter('@Status', requestBody.status);
        
        query.setStringOrNullParameter('@StatusCategory', requestBody.statusCategory);
        query.setValueOrNullParameter('@StatusTransitionDateTime', requestBody.statusTransitionDateTime);
        query.setStringOrNullParameter('@EducationLevelCode', requestBody.educationLevelCode);
        query.setStringOrNullParameter('@Citizenship', requestBody.citizenship);
        query.setStringOrNullParameter('@RequestJSON', requestBody.requestJSON);
        query.setValueOrNullParameter('@DateAdded', requestBody.dateAdded);
        query.setValueOrNullParameter('@ProfileID', requestBody.profileId);
        query.setStringOrNullParameter('@PreviousEmployer1Title', requestBody.previousEmployer1Title);
        query.setStringOrNullParameter('@PreviousEmployer2Title', requestBody.previousEmployer2Title);
        query.setStringOrNullParameter('@PreviousEmployer3Title', requestBody.previousEmployer3Title);

        const payload = { 
            tenantId, 
            queryName: query.name, 
            query: query.value, 
            queryType: QueryType.Simple 
        } as DatabaseEvent;

        await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);

        //
        // auditing log
        //
        const logResult = { ...requestBody };

        for (const key  in logResult) {
            if (typeof logResult[key] === 'string') {
                logResult[key] = utilService.sanitizeStringForSql(logResult[key]);
            }
        }

        utilService.logToAuditTrail({
            userEmail,
            oldFields: oldValues,
            newFields: logResult,
            type: AuditActionType.Update,
            companyId: '',
            areaOfChange: AuditAreaOfChange.ApplicantTracking,
            tenantId,
        } as IAudit);

        //
        // api response
        //
        return true;
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }
        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}
