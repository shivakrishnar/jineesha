-- --Applicant Fields
declare @_schemeId as nvarchar(30) = '@schemeId';
declare @_schemeAgencyId as nvarchar(10) = '@schemeAgencyId';
declare @_externalCandidateID as nvarchar(max) = '@externalCandidateID';

declare @_givenName as nvarchar(50) = '@givenName';
declare @_familyName as nvarchar(100) = '@familyName';
declare @_gender as nvarchar(10) = '@gender';
declare @_citizenship as nvarchar(60) = '@citizenship';
declare @_applyDate as nvarchar(max) = '@applyDate';
declare @_city as nvarchar(150) = '@city';
declare @_state as nvarchar(200) = '@state'; 
declare @_countrystatetypeid as bigint;
declare @_addressLine as nvarchar(150) = '@addressLine';
declare @_postalCode as nvarchar(15) = '@postalCode' ;
declare @_phone as nvarchar(25) ='@phone';
declare @_email as nvarchar(200) = '@email';
declare @_profileID as nvarchar(max) = '@profileID';
declare @_profileSchemeId as nvarchar(30) =  '@profileSchemeId';
declare @_profileSchemeAgencyId as nvarchar(10) = '@profileSchemeAgencyId';
declare @_positionOpeningID as nvarchar(max) = '@positionOpeningID';
declare @_positionSchemeID as nvarchar(20) = '@positionSchemeID';
declare @_positionAgencyID as nvarchar(10) = '@positionAgencyID';
declare @_positionUri as nvarchar(2200) = '@positionUri';    
declare @_status as nvarchar(50) ='@status';
declare @_statusCategory as nvarchar(50) = '@statusCategory' ;
declare @_statusTransitionDateTime as nvarchar(max) ='@statusTransitionDateTime';
declare @_educationLevelCode as nvarchar(50) = '@educationLevelCode';
declare @_softStatusTypeID as bigint; 

---ATApplicationVersion Fields
declare @_positionTitle as nvarchar(100) ='@positionTitle';
declare @_companyId as nvarchar(max) ='@companyId';
declare @_applicationVersionID as bigint;

--Job Posting Fields
declare @_jobPostingID as bigint;

declare @_requestJson as nvarchar(max) ='@requestJson';



INSERT INTO
    dbo.ATApplicationVersion 
(
    CompanyID,
    Title,
    ATApplicationVersionDate,
    Description
) 
values (
    CAST(@_companyId as bigint), -- company id retrieved based on the secret key that we get from JazzHR integration details
    @_positionTitle, 
    GETDATE(),
    'Application Version Created Automatically By JazzHR' 
)

SELECT  @_applicationVersionID = SCOPE_IDENTITY() 


INSERT INTO dbo.ATJobPosting
(
    CompanyID,
    ATApplicationVersionID, 
    Title,
    Description,
    LinkKey,
    IsOpen
) 
values (
    CAST(@_companyId as bigint),
    @_applicationVersionID, 
    @_positionTitle, 
    'Job Posting Created Automatically By JazzHR', -- Should be present on every Job Posting that is created through the webhook
    NEWID(), 
    1 
)
SELECT @_jobPostingID = SCOPE_IDENTITY() 


SELECT TOP 1 @_countrystatetypeid=ID
FROM dbo.CountryStateType 
WHERE 
(Statename = UPPER(TRIM(@_state))) 
OR
(StateCode = UPPER(TRIM(@_state)))

SELECT TOP 1 @_softStatusTypeID=ID  
FROM dbo.ATSoftStatusType 
WHERE CompanyID =  CAST(@_companyId as bigint)
and Title = 'Application Completed'



INSERT INTO
    dbo.ATApplication
(
    ATJobPostingID,
    FirstName,
    LastName,
    EmailAddress,
    Address1,
    City,
    CountryStateTypeID,
    Zip,
    PhoneCell,
    IsVetStatus_Disabled,
    IsVetStatus_AFServiceMedal,
    VetStatus_MilitaryReserve,
    VetStatus_Veteran,
    IsVetStatus_VietnamEra,
    IsVetStatus_Other,
    ATSoftStatusTypeID,
    ExternalCandidateID,
    ExternalSystem,
    Gender,
    ApplyDate,
    ProfileID,
    SchemeID,
    SchemeAgencyID,
    PositionOpeningID,
    PositionSchemeID,
    PositionAgencyID,
    PositionUri,
    [Status],
    StatusCategory,
    StatusTransitionDateTime,
    EducationLevelCode,
    Citizenship,
    DateAdded,
    RequestJSON

) values (
    @_jobPostingID,
    @_givenName, 
    @_familyName,
    @_email,
    @_addressLine,
    @_city,
    @_countrystatetypeid, 
    @_postalCode,
    @_phone,
    0, 
    0,
    'Declined to disclose - N/A',
    'Declined to disclose - N/A',
    0,
    0,
    @_softStatusTypeID, 
   CAST(@_externalCandidateID as bigint),
    @_schemeAgencyId,
    @_gender,
    CONVERT(datetime2(3),@_applyDate),
    CAST(@_profileID as bigint),
    @_profileSchemeId,
    @_profileSchemeAgencyId,
    CAST(@_positionOpeningID as bigint),
    @_positionSchemeID,
    @_positionAgencyID,
    @_positionUri,  
    @_status,
    @_statusCategory,
    CONVERT(datetime2(3),@_statusTransitionDateTime),
    @_educationLevelCode, 
    @_citizenship,
    GETDATE(),
    @_requestJson
)

SELECT SCOPE_IDENTITY()  as ATApplicationID;



