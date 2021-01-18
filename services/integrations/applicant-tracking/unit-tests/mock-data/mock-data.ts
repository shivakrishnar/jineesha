export const tenantId: string = 'c807d7f9-b391-4525-ac0e-31dbc0cf202b';
export const companyId: string = '600351';
export const verifyContent: string = '{"data": "JazzHR Verify Event"}';
export const incomingInvalidSignature: string = '4ebcb8b94ef47410646419057df2381b75c763463d87b96c6249db3122d6eb9a';
export const incomingValidSignature: string = '62cd9aabc89922c65951d9cd4a6e4ede184e736d9e1092c0334bafa1e336c297';

export const postObject = { 

    "candidate": {
      "person": {
        "id": {
          "value": "39011522",
          "schemeId": "JazzHR Candidate",
          "schemeAgencyId": "JazzHR"
        },
        "name": {
          "given": "Kenny",
          "family": "JazzHR",
          "formattedName": "Kenny JazzHR"
        },
        "gender": "No Answer",
        "citizenship": ["No Answer"],
        "applyDate": "2018-09-17",
        "communication": {
          "address": [
            {
              "city": "Pittsburgh",
              "countrySubdivisions": [{ "type": "state", "value": "PA" }],
              "formattedAddress": "685 West 82st St Pittsburgh PA 15233",
              "line": "685 West 82st St",
              "postalCode": "15233"
            }
          ],
          "phone": [{ "formattedNumber": "888-353-0887" }],
          "email": [{ "address": "kenny.jazzhr@jazzhr.com" }],
          "web": []
        }
      },
      "profiles": [
        {
          "languageCode": "en-US",
          "profileId": {
            "value": "39187151",
            "schemeId": "JazzHR Job Application",
            "schemeAgencyId": "JazzHR"
          },
          "associatedPositionOpenings": [
            {
              "positionOpeningId": {
                "value": "934951",
                "schemeId": "JazzHR Job",
                "schemeAgencyId": "JazzHR"
              },
              "positionTitle": "Sample Job",
              "positionUri": "https://asuresoftwarenfr.applytojob.com/apply/tZqAHP6nnh/Sample-Job",
              "candidateStatus": {
                "name": "New",
                "category": "Active",
                "transitionDateTime": "2018-09-17T17:18:30+00:00"
              }
            }
          ],
          "education": [{ "educationLevelCodes": [{ "name": "No Answer" }] }],
          "attachments": [
            {
              "id": {
                "value": "57691853",
                "schemeId": "JazzHR Document to Candidate,",
                "schemeAgencyId": "JazzHR"
              },
              "descriptions": ["ResumeTest.docx"],
              "url": "https://api.jazz.co/public/document/eyJjc3JmIjoiNmRiMWM2ZTZhMzVhNWU2M2MyZDllZmFlNzIxMjUyYmUiLCJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1ODk2NDcwNDIsImN1c3RvbWVySWQiOjU1MDg1LCJ1c2VySWQiOjM0NzQ0MCwiZG9jdW1lbnRDYW5kaWRhdGVJZCI6NTc2OTE4NTN9.kekjb0OYD6SDVFjGtzUyBfjcJNzpyGJK-OijR69k_Jc"
            },
            {
              "id": {
                "value": "57559232",
                "schemeId": "JazzHR Document to Candidate,",
                "schemeAgencyId": "JazzHR"
              },
              "descriptions": ["applicant summary.pdf"],
              "url": "https://api.jazz.co/public/document/eyJjc3JmIjoiZjZjM2UyNjUwY2Y0NjZiMTg2MDhhMTg5ZDEyMGE0YjMiLCJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1ODk2NDcwNDIsImN1c3RvbWVySWQiOjU1MDg1LCJ1c2VySWQiOjM0NzQ0MCwiZG9jdW1lbnRDYW5kaWRhdGVJZCI6NTc1NTkyMzJ9.dpHQv9IIOCEVPZpmZ4YIcvUSTzDU_Rt7KxtBcubuPW8"
            }
          ]
        }
      ]
    }
};

export const outputResponseObject = {
    recordset: [
        {
            ATApplicationID: 12,
        },
    ],
    output: {},
    rowsAffected: [1],
};

export const emptyDBResponse = {
    recordsets: [[]],
    recordset: [],
    output: {},
    rowsAffected: [0],
};
export const documentResponse = 
{
    "fileName": "applicant summary.pdf",
    "mimeType": "application/pdf",
    "content": "",
}

export const jazzhrSecretKeyDBResponse = {
  recordset: [
      {
        JazzhrSecretKey: 'B0D78206-964C-47D4-BE1F-E06409791ED5' ,
      },
  ],
  output: {},
  rowsAffected: [1],
};

