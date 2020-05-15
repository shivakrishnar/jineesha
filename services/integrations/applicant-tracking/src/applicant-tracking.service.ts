import * as errorService from '../../../errors/error.service';
import { ErrorMessage } from '../../../errors/errorMessage';
import * as utilService from '../../../util.service';
import { Queries } from '../../../queries/queries';
import { ParameterizedQuery } from '../../../queries/parameterizedQuery';
import { Applicant } from './Applicant';
import { DatabaseEvent, QueryType } from '../../../internal-api/database/events';
import { InvocationType } from '../../../util.service';
import { plainToClass } from 'class-transformer';
import * as request from 'request-promise-native';
import * as configService from '../../../config.service';

/**
 * Create Applicant Hired Data from JazzHR into ADHR
 *
 * @returns {Promise<void>} 
 */
export async function createApplicantData(tenantId: string, companyId: string, requestBody: any): Promise<void> {
    //  console.info('applicantTrackingService.createApplicantData');

    //  console.info(JSON.stringify(requestBody));

    try {
        
        const applicant = plainToClass(Applicant, requestBody);

        let createQuery = new ParameterizedQuery('ApplicantCreate', Queries.applicantCreate);
    
        createQuery.setParameter('@givenName', applicant.candidate.person.name.given);
        createQuery.setParameter('@familyName', applicant.candidate.person.name.family);
        createQuery.setParameter('@schemeId', applicant.candidate.person.id.schemeId);
        createQuery.setParameter('@schemeAgencyId', applicant.candidate.person.id.schemeAgencyId);
        createQuery.setParameter('@externalCandidateID', applicant.candidate.person.id.value);
        createQuery.setParameter('@gender', applicant.candidate.person.gender);

        
        //Check if citizenship array has value
        if (applicant.candidate.person.citizenship == undefined || applicant.candidate.person.citizenship.length == 0) {
            createQuery.setParameter('@citizenship', '');
        } else {
            createQuery.setParameter('@citizenship', applicant.candidate.person.citizenship[0]);
        }

        createQuery.setParameter('@applyDate', applicant.candidate.person.applyDate);

        if (applicant.candidate.person.communication.address == undefined || applicant.candidate.person.communication.address.length == 0) {
            createQuery.setParameter('@city', '');
            createQuery.setParameter('@state', '');
            createQuery.setParameter('@addressLine', '');
            createQuery.setParameter('@postalCode', '');
        } else {
            const address = applicant.candidate.person.communication.address[0];

            //city
            createQuery.setParameter('@city', address.city == undefined ? '' : address.city);

            //State
            const countrySubdivisions = address.countrySubdivisions;
            createQuery.setParameter('@state', countrySubdivisions == undefined || countrySubdivisions.length == 0 ? '' : countrySubdivisions[0].value);

            //Address Line
            createQuery.setParameter('@addressLine', address.line == undefined ? '' : address.line);

            //postal code
            createQuery.setParameter('@postalCode', address.postalCode == undefined ? '' : address.postalCode);
        }
        //Phone
        const phone = applicant.candidate.person.communication.phone;
        createQuery.setParameter('@phone', phone == undefined || phone.length == 0 ? '' : phone[0].formattedNumber);

        //email
        const email = applicant.candidate.person.communication.email;
        createQuery.setParameter('@email', email == undefined || email.length == 0 ? '' : email[0].address);
    
        var profileCollection = applicant.candidate.profiles;
        //Profiles 
        if (profileCollection == undefined || profileCollection.length == 0) {
          createQuery.setParameter('@profileID', '');
          createQuery.setParameter('@profileSchemeId', '');
          createQuery.setParameter('@profileSchemeAgencyId', '');
          createQuery.setParameter('@positionOpeningID', '');
          createQuery.setParameter('@positionSchemeID', '');
          createQuery.setParameter('@positionAgencyID', '');
          createQuery.setParameter('@positionUri', '');
          createQuery.setParameter('@positionTitle', '');
          createQuery.setParameter('@status', '');
          createQuery.setParameter('@statusCategory', '');
          createQuery.setParameter('@statusTransitionDateTime', '');
          createQuery.setParameter('@educationLevelCode', '');
         
        }
        else {
          const profile = applicant.candidate.profiles[0];

          createQuery.setParameter('@profileID', profile.profileId.value);
          createQuery.setParameter('@profileSchemeId', profile.profileId.schemeId);
          createQuery.setParameter('@profileSchemeAgencyId', profile.profileId.schemeAgencyId);
          createQuery.setParameter('@positionOpeningID', profile.associatedPositionOpenings[0].positionOpeningId.value);
          createQuery.setParameter('@positionSchemeID', profile.associatedPositionOpenings[0].positionOpeningId.schemeId);
          createQuery.setParameter('@positionAgencyID', profile.associatedPositionOpenings[0].positionOpeningId.schemeAgencyId);
          createQuery.setParameter('@positionUri', profile.associatedPositionOpenings[0].positionUri);
          createQuery.setParameter('@positionTitle', profile.associatedPositionOpenings[0].positionTitle);
          createQuery.setParameter('@status', profile.associatedPositionOpenings[0].candidateStatus.name);
          createQuery.setParameter('@statusCategory', profile.associatedPositionOpenings[0].candidateStatus.category);
          createQuery.setParameter('@statusTransitionDateTime', profile.associatedPositionOpenings[0].candidateStatus.transitionDateTime);

          //educationLevelCodes
          if (profile.education == undefined || profile.education.length == 0) {
            createQuery.setParameter('@educationLevelCode','');
          } else {
            const educationLevelCodes = profile.education[0].educationLevelCodes;
            createQuery.setParameter('@educationLevelCode', 
            (educationLevelCodes == undefined 
              || educationLevelCodes.length == 0)
              ? '' 
              : educationLevelCodes[0].name);
          }
       }

       createQuery.setParameter('@companyId', companyId);
       createQuery.setParameter('@requestJson', JSON.stringify(requestBody));


       let payload = {
            tenantId,
            queryName: createQuery.name,
            query: createQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        //TODO:get the atapplicationid
        const result: any = await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);
       
        if (result.recordset.length != 0) {
            const createdId: number = result.recordset[0].ATApplicationID;
            //console.log(createdId.toString());
            
            //Check if profiles are available
            if (!(profileCollection == undefined || profileCollection.length == 0)) {
            
                //check if profile has attachments
                if (!(profileCollection[0].attachments == undefined || profileCollection[0].attachments.length == 0)) {
            
                    for (let attachment of profileCollection[0].attachments) {
            
                        //fetch attachment from url
                        const url = attachment.url;
                        const response = JSON.parse(await request.get({ url }));

                        const { fileName, mimeType , content} = response;
                        const extension = '.' + fileName.split('.')[1];

                        let fileSize : number;
                        fileSize =calculateFileSize(content);
                        
                        createQuery = new ParameterizedQuery('DocumentCreate', Queries.documentCreate);

                        createQuery.setParameter('@fileName', fileName);
                        createQuery.setParameter('@extension', extension);
                        createQuery.setParameter('@contentType', mimeType);
                        createQuery.setParameter('@applicationID', createdId);
                        createQuery.setParameter('@content', content);
                        createQuery.setParameter('@externalDocumentID', attachment.id.value);
                        createQuery.setParameter('@fileSize', fileSize);
 
                        payload = {
                            tenantId,
                            queryName: createQuery.name,
                            query: createQuery.value,
                            queryType: QueryType.Simple,
                        } as DatabaseEvent;

                        await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);
                    }
                }
            }

            await clearCache(tenantId);
        }
       
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }

}

function calculateFileSize(base64String : any){
    let padding, inBytes, base64StringLength;
    if(base64String.endsWith("==")) padding = 2;
    else if (base64String.endsWith("=")) padding = 1;
    else padding = 0;

    base64StringLength = base64String.length;
    inBytes =(base64StringLength / 4 ) * 3 - padding;
    return Math.ceil((inBytes / 1024));
  }


 /**
 * Clear Cache with only tenantId available. ssoToken need to be determined
 *
 * 
 */
async function clearCache(tenantId: string){
    let secretId: string;
    secretId = configService.getApiSecretId();
    const secret = await utilService.getSecret(secretId);
    const applicationId = JSON.parse(secret).applicationId;
    const ssoToken = await utilService.getSSOToken(tenantId, applicationId);
    await utilService.clearCache(tenantId, ssoToken);
    
}
