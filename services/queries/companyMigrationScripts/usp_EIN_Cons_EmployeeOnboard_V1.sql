/*-----------------------------------------------------------------
 usp_EIN_Cons_EmployeeOnboard_V1
-----------------------------------------------------------------*/
/*
	Syntax	: exec  usp_EIN_Cons_EmployeeOnboard_V1
		Ex.	: 	
			execute usp_EIN_Cons_EmployeeOnboard_V1 '[adhr-1].[dbo].', '[adhr-2].[dbo].', 1, 0, '600373', '600351', 'ShowData', 'ZZZ'
			execute usp_EIN_Cons_EmployeeOnboard_V1 '[adhr-1].[dbo].', '[adhr-2].[dbo].', 1, 0, '600373', '600351', 'Insert', 'N'
			execute usp_EIN_Cons_EmployeeOnboard_V1 '[adhr-1].[dbo].', '[adhr-2].[dbo].', 1, 0, '600373', '600351', 'InsertFullValidate', 'ZZZ'
			execute usp_EIN_Cons_EmployeeOnboard_V1 '[adhr-1].[dbo].', '[adhr-2].[dbo].', 1, 0, '600373', '600351', 'Delete', 'ZZZ'
		
	Purpose	:

	Params	: none. 
	Calls	: none.
	Returns	: none.
	Special	: none.
	Notes	: none.
	Author	: Tom Signor	Date : 05/09/21
	Notice	: Copyright (c) 2021 Asure Inc., All Rights Reserved.

	Last Mod	:
*/
/*-----------------------------------------------------------------*/
/*	First Drop Proc dbo.usp_EIN_Cons_EmployeeOnboard_V1 */
	if object_id('dbo.usp_EIN_Cons_EmployeeOnboard_V1') is not null
	begin
		drop procedure dbo.usp_EIN_Cons_EmployeeOnboard_V1
		print 'Dropped Proc dbo.usp_EIN_Cons_EmployeeOnboard_V1 '
	end
GO

	create procedure usp_EIN_Cons_EmployeeOnboard_V1
	
		@cDonorDatabasePath		char(75),
		@cRecipientDatabasePath	char(100),
		@cVerbose_Ind			bit,
		@cShowStatement			bit,
		@cRecipientCompany_ID	char(8),
		@cDonorCompany_ID		char(8),
		@cValidateType_Cd		char(20),
		@cTableToRun			char(27)
		--@cTableName				char(50)

	with encryption
	as

	-- HRN IT Services Test company 600373

	--setup Exist vars
	declare @nDonorExistCount tinyint
	select @nDonorExistCount = 1
	declare @nRecipientExistCount tinyint
	select @nRecipientExistCount = 0
	declare @cDonorCountPath nvarchar(100)
	declare @cRecipientCountPath char(100)

	--setup Fail vars
	declare @cFailCodes char(256)
	select  @cFailCodes = ''

	declare @cmdColumns nvarchar(max)
	declare @cmdSelect nvarchar(max)
	declare @cmdInsert nvarchar(max)
	declare @cmdCombine nvarchar(max)
	declare @cmdCountDataDonor nvarchar(max)
	declare @cmdCountDataRecipient nvarchar(max)
	declare @cmdShowDataDonor nvarchar(max)
	declare @cmdShowDataRecipient nvarchar(max)
	declare @cDonorTablePath char(75)
	declare @cRecipientTablePath char(100)
	declare @cDonorCompanyID char(8)
	declare @cRecipientCompanyID char(8)

	declare @DonorT1EmpCd bigint
	declare @DonorT1ID bigint
	declare @RecipientT1EmpCd bigint
	declare @RecipientT1ID bigint

	select @cDonorTablePath = @cDonorDatabasePath			--'[adhr-1].[dbo].'
	select @cRecipientTablePath = @cRecipientDatabasePath	--'[adhr-2].[dbo].'

	--select @cDonorCountPath = trim(@cDonorTablePath)+trim(@cTableName)
	--select @cRecipientCountPath = trim(@cRecipientTablePath)+trim(@cTableName)
--	select @cDonorCountPath

	set nocount on
	
	-- ------------------------------------------------------------
	-- This Query just returns the data from Donor system without verifiyng or moving anything
	if @cValidateType_Cd = 'ShowData'
	
	begin

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%A%'
		begin
            select @cmdShowDataDonor = 'select
                '+@cRecipientCompany_ID+' as CompanyID,
                donor_eo.EmployeeCode,
                donor_eo.FirstName,
                donor_eo.LastName,
                donor_eo.MiddleName,
                donor_eo.Prefix,
                donor_eo.Suffix,
                donor_eo.NickName,
                donor_eo.CompanyName,
                donor_eo.Address1,
                donor_eo.Address2,
                donor_eo.City,
                recip_cst.ID as CountryStateTypeID,
                donor_eo.Zip,
                donor_eo.EmailAddress,
                donor_eo.PhoneHome,
                donor_eo.PhoneWork,
                donor_eo.PhoneCell,
                donor_eo.BirthDate,
                donor_eo.SSN,
                donor_eo.AlternateTaxNumber,
                donor_eo.ClockNumber,
                donor_eo.OB_HireDate,
                recip_tft.ID as TaxFormTypeID,
                recip_elt.ID as EducationLevelTypeID,
                recip_gt.ID as GenderTypeID,
                recip_mst.ID as MaritalStatusTypeID,
                recip_etht.ID as EthnicityTypeID,
                recipDiv1.ID as EPO_Org1ID,
                recipBranch2.ID as EPO_Org2ID,
                recipDep3.ID as EPO_Org3ID,
                recipTeam4.ID as EPO_Org4ID,
                NULL as EPO_Org5ID,
                recip_sup1.ID as EPO_Supervisor1ID,
                recip_sup2.ID as EPO_Supervisor2ID,
                recip_sup3.ID as EPO_Supervisor3ID,
                recip_pt.ID as EPO_PositionTypeID,
                recip_et.ID as EPO_EmploymentTypeID,
                recip_st.ID as EPO_StatusTypeID,
                recip_pocr.ID as EPO_PositionOrganizationChangeReasonID,
                recip_wct.ID as EPO_WorkerCompTypeID,
                recip_pgt.ID as EPO_PayGroupTypeID,
                recip_eeo.ID as EPO_EEOTypeID,
                recip_payt.ID as COMP_PayTypeID,
                recip_ft.ID as COMP_FrequencyTypeID,
                recip_apt.ID as COMP_AutoPayTypeID,
                donor_eo.COMP_Rate,
                donor_eo.COMP_DefaultHours,
                donor_eo.EC_ContactType,
                donor_eo.EC_FirstName,
                donor_eo.EC_MiddleName,
                donor_eo.EC_LastName,
                donor_eo.EC_Address1,
                donor_eo.EC_Address2,
                donor_eo.EC_City,
                recip_ec_cst.ID as EC_CountryStateTypeID,
                donor_eo.EC_Zip,
                donor_eo.EC_EmailAddress,
                donor_eo.EC_PhoneHome,
                donor_eo.EC_PhoneWork,
                donor_eo.EC_PhoneCell,
                donor_eo.TAX_FITW_FilingStatusID,
                donor_eo.TAX_FITW_Exemptions1,
                donor_eo.TAX_FITW_Exemptions2,
                donor_eo.TAX_SITW_StateID,
                donor_eo.TAX_SITW_FilingStatusID,
                donor_eo.TAX_SITW_Exemptions1,
                donor_eo.TAX_SITW_Exemptions2,
                donor_eo.TAX_SITW_Percentage,
                donor_eo.TAX_SUI_StateID,
                donor_eo.TAX_LOC1_TaxCodeID,
                donor_eo.TAX_LOC1_FilingStatusID,
                donor_eo.TAX_LOC1_Exemptions1,
                donor_eo.TAX_LOC1_Exemptions2,
                donor_eo.TAX_LOC2_TaxCodeID,
                donor_eo.TAX_LOC2_FilingStatusID,
                donor_eo.TAX_LOC2_Exemptions1,
                donor_eo.TAX_LOC2_Exemptions2,
                donor_eo.TAX_LOC3_TaxCodeID,
                donor_eo.TAX_LOC3_FilingStatusID,
                donor_eo.TAX_LOC3_Exemptions1,
                donor_eo.TAX_LOC3_Exemptions2,
                donor_eo.TAX_LOC4_TaxCodeID,
                donor_eo.TAX_LOC4_FilingStatusID,
                donor_eo.TAX_LOC4_Exemptions1,
                donor_eo.TAX_LOC4_Exemptions2,
                donor_eo.TAX_LOC5_TaxCodeID,
                donor_eo.TAX_LOC5_FilingStatusID,
                donor_eo.TAX_LOC5_Exemptions1,
                donor_eo.TAX_LOC5_Exemptions2,
                recip_user.ID as USER_HRnextUserID,
                donor_eo.TAX_WorkStateID,
                donor_eo.USER_NewUserSendWelcome,
                recip_ccr.ID as COMP_CompensationChangeReasonID,
                recip_ost.ID as OnboardingStatusTypeID,
                donor_eo.OB_Key,
                donor_eo.OB_Step1Date,
                donor_eo.OB_Step2Date,
                donor_eo.OB_Step3Date,
                donor_eo.OB_Step4Date,
                donor_eo.OB_Step5Date,
                donor_eo.OB_Step1UserName,
                donor_eo.OB_Step5UserName,
                recip_otl.ID as OnboardingTaskListID,
                donor_eo.DD_1_Priority,
                donor_eo.DD_1_RoutingNumber,
                donor_eo.DD_1_Account,
                donor_eo.DD_1_Checking,
                donor_eo.DD_1_AmountCode,
                donor_eo.DD_1_Amount,
                donor_eo.DD_1_ExcludeSpecial,
                donor_eo.DD_1_PreNoteDate,
                donor_eo.DD_1_NameOnAccount,
                donor_eo.DD_1_StartDate,
                donor_eo.DD_1_EndDate,
                donor_eo.DD_2_Priority,
                donor_eo.DD_2_RoutingNumber,
                donor_eo.DD_2_Account,
                donor_eo.DD_2_Checking,
                donor_eo.DD_2_AmountCode,
                donor_eo.DD_2_Amount,
                donor_eo.DD_2_ExcludeSpecial,
                donor_eo.DD_2_PreNoteDate,
                donor_eo.DD_2_NameOnAccount,
                donor_eo.DD_2_StartDate,
                donor_eo.DD_2_EndDate,
                donor_eo.DD_3_Priority,
                donor_eo.DD_3_RoutingNumber,
                donor_eo.DD_3_Account,
                donor_eo.DD_3_Checking,
                donor_eo.DD_3_AmountCode,
                donor_eo.DD_3_Amount,
                donor_eo.DD_3_ExcludeSpecial,
                donor_eo.DD_3_PreNoteDate,
                donor_eo.DD_3_NameOnAccount,
                donor_eo.DD_3_StartDate,
                donor_eo.DD_3_EndDate,
                donor_eo.DD_EsignName,
                donor_eo.DD_EsignStamptedDateTime,
                donor_eo.I9_SEC1_FirstName,
                donor_eo.I9_SEC1_LastName,
                donor_eo.I9_SEC1_MiddleInitial,
                donor_eo.I9_SEC1_OtherNamesUsed,
                donor_eo.I9_SEC1_Address1,
                donor_eo.I9_SEC1_City,
                donor_eo.I9_SEC1_Zip,
                donor_eo.I9_SEC1_SSN,
                donor_eo.I9_SEC1_DOB,
                donor_eo.I9_SEC1_EmailAddress,
                donor_eo.I9_SEC1_PhoneHome,
                donor_eo.I9_SEC1_IsUSCitizen,
                donor_eo.I9_SEC1_IsUSNonCitizenNational,
                donor_eo.I9_SEC1_IsUSPR,
                donor_eo.I9_SEC1_IsAlien,
                donor_eo.I9_SEC1_PRUSCISNumber,
                donor_eo.I9_SEC1_AlienWorkExpirationDate,
                donor_eo.I9_SEC1_AlienUSCISNumber,
                donor_eo.I9_SEC1_AlienI94Number,
                donor_eo.I9_SEC1_AlienForeignPassportNumber,
                donor_eo.I9_SEC1_AlienCountryOfIssuance,
                donor_eo.I9_SEC1_EsignName,
                donor_eo.I9_SEC1_EsignFormDate,
                donor_eo.I9_SEC1_EsignStamptedDateTime,
                donor_eo.BC_FullLegalName,
                donor_eo.BC_OtherNamesUsed,
                donor_eo.BC_Address1,
                donor_eo.BC_City,
                recip_bc_cst.ID as BC_CountryStateTypeID,
                donor_eo.BC_Zip,
                donor_eo.BC_SSN,
                donor_eo.BC_DOB,
                donor_eo.BC_DLName,
                donor_eo.BC_DLNumber,
                recip_bc_dl_cst.ID as BC_DLCountryStateTypeID,
                donor_eo.BC_EsignName,
                donor_eo.BC_EsignFormDate,
                donor_eo.BC_EsignStamptedDateTime,
                donor_eo.CD_EsignName,
                donor_eo.CD_EsignStamptedDateTime,
                recip_ata.ID as ATApplicationID,
                donor_eo.W4_BOX1_FirstName,
                donor_eo.W4_BOX1_LastName,
                donor_eo.W4_BOX1_MiddleInitial,
                donor_eo.W4_BOX1_Address1,
                donor_eo.W4_BOX1_City,
                donor_eo.W4_BOX1_CountryStateTypeID,
                donor_eo.W4_BOX1_Zip,
                donor_eo.W4_BOX2_SSN,
                donor_eo.W4_BOX3_IsSingle,
                donor_eo.W4_BOX3_IsMarried,
                donor_eo.W4_BOX3_IsMarriedButWHAtHigherSingleRate,
                donor_eo.W4_BOX4_IsNameDifferentFromSSCard,
                donor_eo.W4_BOX5_TotalAllowances,
                donor_eo.W4_BOX6_AdditionalAmountWH,
                donor_eo.W4_BOX7_IsExempt,
                donor_eo.W4_BOX7_ExemptText,
                donor_eo.W4_EsignName,
                donor_eo.W4_EsignFormDate,
                donor_eo.W4_EsignStamptedDateTime,
                donor_eo.TAX_FITW_AdditionalAmount,
                donor_eo.EPO_AlternateSupervisor,
                donor_eo.TC_SC_Excluded,
                donor_eo.TC_SC_Options,
                donor_eo.TC_SC_ExportBlock,
                donor_eo.TC_SC_WebClockEnabled,
                donor_eo.TC_SC_MobileEnabled,
                donor_eo.TC_SC_MobilePunchEnabled,
                donor_eo.TC_SC_GeoDataEnabled,
                donor_eo.TC_SC_EnforceSchedule,
                donor_eo.UD_Memo1,
                donor_eo.UD_Memo2,
                donor_eo.UD_Memo3,
                donor_eo.I9_SEC1_Apartment,
                donor_eo.I9_SEC1_Prep_FirstName,
                donor_eo.I9_SEC1_Prep_LastName,
                donor_eo.I9_SEC1_Prep_Address1,
                donor_eo.I9_SEC1_Prep_City,
                donor_eo.I9_SEC1_Prep_Zip,
                donor_eo.I9_SEC1_Prep_IsPreparer,
                donor_eo.I9_SEC1_Prep_EsignName,
                donor_eo.I9_SEC1_Prep_EsignFormDate,
                donor_eo.I9_SEC1_Prep_EsignStamptedDateTime,
                donor_eo.I9_SEC1_PRAlienRegNumber,
                donor_eo.I9_SEC1_AlienAlienRegNumber,
                donor_eo.I9_SEC1_Prep_CountryStateTypeCode,
                donor_eo.I9_SEC1_CountryStateTypeCode,
                donor_eo.EndNote_EsignName,
                donor_eo.EndNote_EsignStamptedDateTime,
                donor_eo.CustomDocumentUpload_EsignName,
                donor_eo.CustomDocumentUpload_EsignStamptedDateTime,
                donor_eo.IsVetStatus_Disabled,
                donor_eo.IsVetStatus_RecentlySeparated,
                donor_eo.IsVetStatus_ActiveDutyWartime,
                donor_eo.IsVetStatus_AFServiceMedal,
                donor_eo.VetStatus_DischargeDate,
                donor_eo.VetStatus_MilitaryReserve,
                donor_eo.VetStatus_Veteran,
                donor_eo.IsVetStatus_VietnamEra,
                donor_eo.IsVetStatus_Other,
                donor_eo.TAX_EVO_Fed_MaritalStatus,
                donor_eo.TAX_EVO_Fed_Exemptions,
                donor_eo.TAX_EVO_Fed_TaxType,
                donor_eo.TAX_EVO_Fed_AdditionalAmount,
                donor_eo.TAX_EVO_Fed_TaxStatus,
                donor_eo.TAX_EVO_State_WorkState,
                donor_eo.TAX_EVO_State_SUIState,
                donor_eo.TAX_EVO_State_SDIState,
                donor_eo.TAX_EVO_State_MaritalStatus,
                donor_eo.TAX_EVO_State_Exemptions,
                donor_eo.TAX_EVO_State_TaxType,
                donor_eo.TAX_EVO_State_AdditionalAmount,
                donor_eo.TAX_EVO_State_TaxStatus,
                donor_eo.EligibleForBenefitsDate_EVO,
                recip_hs_cst.ID as HomeStateID_EVO,
                recip_bc.ID as BenefitClassID,
                recip_ft_evo.ID as FrequencyTypeID_EVO,
                donor_eo.StandardPayrollHours_EVO,
                donor_eo.FLSAClassification_EVO,
                donor_eo.IsEligibleForRehire,
                donor_eo.MedicalCoverageOffered_EVO,
                donor_eo.DD_1_IsSavings,
                donor_eo.DD_1_IsMoneyMarket,
                donor_eo.DD_2_IsSavings,
                donor_eo.DD_2_IsMoneyMarket,
                donor_eo.DD_3_IsSavings,
                donor_eo.DD_3_IsMoneyMarket,
                donor_eo.EvoApproveDD1,
                donor_eo.EvoApproveDD2,
                donor_eo.EvoApproveDD3,
                donor_eo.Evo_DD_1_Approval_Status,
                donor_eo.Evo_DD_2_Approval_Status,
                donor_eo.Evo_DD_3_Approval_Status,
                donor_eo.Evo_DD_1_isPrenote,
                donor_eo.Evo_DD_2_isPrenote,
                donor_eo.Evo_DD_3_isPrenote,
                donor_eo.Evo_DD_1_deductionCode,
                donor_eo.Evo_DD_2_deductionCode,
                donor_eo.Evo_DD_3_deductionCode,
                donor_eo.IsEIN1099Employee,
                donor_eo.PayGroup_EVO,
                donor_eo.AccrualGroup_TLM,
                donor_eo.IsSupervisor_TLM,
                donor_eo.Supervisor_TLM,
                donor_eo.W4_FirstName,
                donor_eo.W4_LastName,
                donor_eo.W4_MiddleInitial,
                donor_eo.W4_Address1,
                donor_eo.W4_City,
                recip_w4_cst.ID as W4_CountryStateTypeID,
                donor_eo.W4_Zip,               
                donor_eo.W4_SSN,
                donor_eo.W4_MaritalStatus,
                donor_eo.W4_HigherRate,
                donor_eo.W4_DependentsUnderSeventeen,
                donor_eo.W4_OtherDependents,
                donor_eo.W4_OtherIncome,
                donor_eo.W4_AdditionalDeductions,
                donor_eo.W4_ExtraWithholding,
                donor_eo.W4_Exempt,
                donor_eo.W4_OtherTaxCredits,
                donor_eo.CompanyJobID_EVO

                From '+trim(@cDonorTablePath)+'EmployeeOnboard donor_eo
                join '+trim(@cDonorTablePath)+'OrganizationStructure donor_os1 on donor_os1.CompanyID = donor_eo.CompanyID
                join '+trim(@cRecipientTablePath)+'OrganizationStructure recip_os1 on recip_os1.CompanyID = '+@cRecipientCompany_ID+'
                left join '+trim(@cDonorTablePath)+'OrganizationType donorDiv1 on ISNULL(donor_eo.EPO_Org1ID, 0) = ISNULL(donorDiv1.ID, 0)
                left join '+trim(@cRecipientTablePath)+'OrganizationType recipDiv1 on
                recipDiv1.OrganizationStructureID = recip_os1.ID and
                recipDiv1.Code = donorDiv1.Code and
                recipDiv1.Org1ParentID is null

                join '+trim(@cDonorTablePath)+'OrganizationStructure donor_os2 on donor_os2.CompanyID = donor_eo.CompanyID
                join '+trim(@cRecipientTablePath)+'OrganizationStructure recip_os2 on recip_os2.CompanyID = '+@cRecipientCompany_ID+'
                left join '+trim(@cDonorTablePath)+'OrganizationType donorBranch2 on ISNULL(donorBranch2.ID, 0) = ISNULL(donor_eo.EPO_Org2ID, 0)
                left join '+trim(@cDonorTablePath)+'OrganizationType donorDiv2 on donorDiv2.ID = donorBranch2.Org1ParentID
                left join '+trim(@cRecipientTablePath)+'OrganizationType recipDiv2 on
                    recipDiv2.OrganizationStructureID = recip_os2.ID and
                    recipDiv2.Code = donorDiv2.Code and
                    recipDiv2.Org1ParentID is null
                left join '+trim(@cRecipientTablePath)+'OrganizationType recipBranch2 on
                    recipBranch2.OrganizationStructureID = recip_os2.ID and
                    recipBranch2.Code = donorBranch2.Code and
                    recipBranch2.Org1ParentID = recipDiv2.ID and
                    recipBranch2.Org2ParentID is null

                join '+trim(@cDonorTablePath)+'OrganizationStructure donor_os3 on donor_os3.CompanyID = donor_eo.CompanyID
                join '+trim(@cRecipientTablePath)+'OrganizationStructure recip_os3 on recip_os3.CompanyID = '+@cRecipientCompany_ID+'
                left join '+trim(@cDonorTablePath)+'OrganizationType donorDep3 on donorDep3.ID = donor_eo.EPO_Org3ID
                left join '+trim(@cDonorTablePath)+'OrganizationType donorBranch3 on donorBranch3.ID = donorDep3.Org2ParentID
                left join '+trim(@cDonorTablePath)+'OrganizationType donorDiv3 on donorDiv3.ID = donorDep3.Org1ParentID
                left join '+trim(@cRecipientTablePath)+'OrganizationType recipDiv3 on
                    recipDiv3.OrganizationStructureID = recip_os3.ID and
                    recipDiv3.Code = donorDiv3.Code and
                    recipDiv3.Org1ParentID is null
                left join '+trim(@cRecipientTablePath)+'OrganizationType recipBranch3 on
                    recipBranch3.OrganizationStructureID = recip_os3.ID and
                    recipBranch3.Code = donorBranch3.Code and
                    recipBranch3.Org1ParentID = recipDiv3.ID and
                    recipBranch3.Org2ParentID is null
                left join '+trim(@cRecipientTablePath)+'OrganizationType recipDep3 on
                    recipDep3.OrganizationStructureID = recip_os3.ID and
                    recipDep3.Code = donorDep3.Code and
                    recipDep3.Org2ParentID = recipBranch3.ID and
                    recipDep3.Org1ParentID = recipDiv3.ID and
                    recipDep3.Org3ParentID is null

                join '+trim(@cDonorTablePath)+'OrganizationStructure donor_os4 on donor_os4.CompanyID = donor_eo.CompanyID
                join '+trim(@cRecipientTablePath)+'OrganizationStructure recip_os4 on recip_os4.CompanyID = '+@cRecipientCompany_ID+'
                left join '+trim(@cDonorTablePath)+'OrganizationType donorTeam4 on donorTeam4.ID = donor_eo.EPO_Org4ID
                left join '+trim(@cDonorTablePath)+'OrganizationType donorDep4 on donorDep4.ID = donorTeam4.Org3ParentID
                left join '+trim(@cDonorTablePath)+' OrganizationType donorBranch4 on donorBranch4.ID = donorTeam4.Org2ParentID
                left join '+trim(@cDonorTablePath)+'OrganizationType donorDiv4 on donorDiv4.ID = donorTeam4.Org1ParentID
                left join '+trim(@cRecipientTablePath)+'OrganizationType recipDiv4 on
                    recipDiv4.OrganizationStructureID = recip_os4.ID and
                    recipDiv4.Code = donorDiv4.Code and
                    recipDiv4.Org1ParentID is null
                left join '+trim(@cRecipientTablePath)+'OrganizationType recipBranch4 on
                    recipBranch4.OrganizationStructureID = recip_os4.ID and
                    recipBranch4.Code = donorBranch4.Code and
                    recipBranch4.Org1ParentID = recipDiv4.ID and
                    recipBranch4.Org2ParentID is null
                left join '+trim(@cRecipientTablePath)+'OrganizationType recipDep4 on
                    recipDep4.OrganizationStructureID = recip_os4.ID and
                    recipDep4.Code = donorDep4.Code and
                    recipDep4.Org2ParentID = recipBranch4.ID and
                    recipDep4.Org1ParentID = recipDiv4.ID and
                    recipDep4.Org3ParentID is null
                left join '+trim(@cRecipientTablePath)+'OrganizationType recipTeam4 on
                    recipTeam4.OrganizationStructureID = recip_os4.ID and
                    recipTeam4.Code = donorTeam4.Code and
                    recipTeam4.Org3ParentID = recipDep4.ID and
                    recipTeam4.Org2ParentID = recipBranch4.ID and
                    recipTeam4.Org1ParentID = recipDiv4.ID and
                    recipTeam4.Org4ParentID is null

                left join '+trim(@cDonorTablePath)+'StatusType donor_st on donor_eo.EPO_StatusTypeID = donor_st.ID
                left join '+trim(@cRecipientTablePath)+'StatusType recip_st on recip_st.CompanyID = '+@cRecipientCompany_ID+'
                    and isnull(recip_st.Code, '''') = isnull(donor_st.Code, '''')
                    and isnull(recip_st.Description, '''') = isnull(donor_st.Description, '''')
                    and isnull(recip_st.Priority, 0) = isnull(donor_st.Priority, 0)
                    and isnull(recip_st.Active, 0) = isnull(donor_st.Active, 0)
                    and isnull(recip_st.IndicatesActiveEmployee, 0) = isnull(donor_st.IndicatesActiveEmployee, 0)

                left join '+trim(@cDonorTablePath)+'PositionType donor_pt on donor_eo.EPO_PositionTypeID = donor_pt.ID
                left join '+trim(@cRecipientTablePath)+'PositionType recip_pt on recip_pt.CompanyID = '+@cRecipientCompany_ID+'
                    and isnull(recip_pt.Code, '''') = isnull(donor_pt.Code, '''')
                    and isnull(recip_pt.Title, '''') = isnull(donor_pt.Title, '''')
                    and isnull(recip_pt.Priority, 0) = isnull(donor_pt.Priority, 0)
                    and isnull(recip_pt.Active, 0) = isnull(donor_pt.Active, 0)
                    and coalesce(convert(nvarchar(255), recip_pt.ApprovedDate), '''') = coalesce(convert(nvarchar(255), donor_pt.ApprovedDate), '''')
                    and coalesce(convert(nvarchar(255), recip_pt.EffectiveDate), '''') = coalesce(convert(nvarchar(255), donor_pt.EffectiveDate), '''')
                    and coalesce(convert(nvarchar(255), recip_pt.ClosedDate), '''') = coalesce(convert(nvarchar(255), donor_pt.ClosedDate), '''')
                    and isnull(recip_pt.IsBudgeted, 0) = isnull(donor_pt.IsBudgeted, 0)
                    and isnull(recip_pt.FTE, 0) = isnull(donor_pt.FTE, 0)
                    and isnull(recip_pt.Description, '''') = isnull(donor_pt.Description, '''')
                    and isnull(recip_pt.IsOTExempt, 0) = isnull(donor_pt.IsOTExempt, 0)
                    and isnull(recip_pt.PR_Integration_PK, -1) = isnull(donor_pt.PR_Integration_PK, -1)

                left join '+trim(@cDonorTablePath)+'OnboardingTaskList donor_otl on donor_eo.OnboardingTaskListID = donor_otl.ID
                left join '+trim(@cRecipientTablePath)+'OnboardingTaskList recip_otl on donor_eo.CompanyID = '+@cRecipientCompany_ID+'
                    and isnull(recip_otl.Title, '''') = isnull(donor_otl.Title, '''')
                    and isnull(recip_otl.Description, '''') = isnull(donor_otl.Description, '''')
                    and isnull(recip_otl.WelcomeNote, '''') = isnull(donor_otl.WelcomeNote, '''')
                    and isnull(recip_otl.EndNote, '''') = isnull(donor_otl.EndNote, '''')
                    and isnull(recip_otl.CustomDocumentUploadNote, '''') = isnull(donor_otl.CustomDocumentUploadNote, 0)

                left join '+trim(@cDonorTablePath)+'EmploymentType donor_et on donor_eo.EPO_EmploymentTypeID = donor_et.ID
                left join '+trim(@cRecipientTablePath)+'EmploymentType recip_et on recip_et.CompanyID = '+@cRecipientCompany_ID+'
                    and isnull(recip_et.Code, '''') = isnull(donor_et.Code, '''')
                    and isnull(recip_et.Description, '''') = isnull(donor_et.Description, '''')
                    and isnull(recip_et.Priority, 0) = isnull(donor_et.Priority, 0)
                    and isnull(recip_et.Active, 0) = isnull(donor_et.Active, 0)

                left join '+trim(@cDonorTablePath)+'PositionOrganizationChangeReason donor_pocr on donor_eo.EPO_PositionOrganizationChangeReasonID = donor_pocr.ID
                left join '+trim(@cRecipientTablePath)+'PositionOrganizationChangeReason recip_pocr on recip_pocr.CompanyID = '+@cRecipientCompany_ID+'
                    and isnull(recip_pocr.Code, '''') = isnull(donor_pocr.Code, '''')
                    and isnull(recip_pocr.Description, '''') = isnull(donor_pocr.Description, '''')
                    and isnull(recip_pocr.Priority, 0) = isnull(donor_pocr.Priority, 0)
                    and isnull(recip_pocr.Active, 0) = isnull(donor_pocr.Active, 0)

                left join '+trim(@cDonorTablePath)+'WorkerCompType donor_wct on donor_eo.EPO_WorkerCompTypeID = donor_wct.ID
                left join '+trim(@cDonorTablePath)+'CountryStateType donor_wctcst on donor_wctcst.ID = donor_wct.CountryStateTypeID
                left join '+trim(@cRecipientTablePath)+'CountryStateType recip_wctcst on
                    recip_wctcst.CountryCode = donor_wctcst.CountryCode
                    and recip_wctcst.StateCode = donor_wctcst.StateCode
                left join '+trim(@cRecipientTablePath)+'WorkerCompType recip_wct on recip_wct.CompanyID = '+@cRecipientCompany_ID+'
                    and isnull(recip_wct.Code, '''') = isnull(donor_wct.Code, '''')
                    and isnull(recip_wct.Description, '''') = isnull(donor_wct.Description, '''')
                    and isnull(recip_wct.Priority, 0) = isnull(donor_wct.Priority, 0)
                    and isnull(recip_wct.Active, 0) = isnull(donor_wct.Active, 0)
                    and isnull(recip_wct.Rate, 0) = isnull(donor_wct.Rate, 0)
                    and isnull(recip_wct.ExperienceRating, 0) = isnull(donor_wct.ExperienceRating, 0)
                    and isnull(recip_wct.EvoFK_EDGroup, 0) = isnull(donor_wct.EvoFK_EDGroup, 0)
                    and isnull(recip_wct.OvertimeToReduce_EVO, '''') = isnull(donor_wct.OvertimeToReduce_EVO, '''')
                    and isnull(recip_wct.CountryStateTypeID, 0) = isnull(recip_wctcst.ID, 0)

                left join '+trim(@cDonorTablePath)+'PayGroupType donor_pgt on donor_eo.EPO_PayGroupTypeID = donor_pgt.ID
                left join '+trim(@cRecipientTablePath)+'PayGroupType recip_pgt on recip_pgt.CompanyID = '+@cRecipientCompany_ID+'
                    and isnull(recip_pgt.Code, '''') = isnull(donor_pgt.Code, '''')
                    and isnull(recip_pgt.Description, '''') = isnull(donor_pgt.Description, '''')
                    and isnull(recip_pgt.Priority, 0) = isnull(donor_pgt.Priority, 0)
                    and isnull(recip_pgt.Active, 0) = isnull(donor_pgt.Active, 0)
                    and isnull(recip_pgt.PR_Integration_PK, -1) = isnull(donor_pgt.PR_Integration_PK, -1)

                left join '+trim(@cDonorTablePath)+'EEOType donor_eeo on donor_eo.EPO_EEOTypeID = donor_eeo.ID
                left join '+trim(@cRecipientTablePath)+'EEOType recip_eeo on recip_eeo.CompanyID = '+@cRecipientCompany_ID+'
                    and isnull(recip_eeo.Code, '''') = isnull(donor_eeo.Code, '''')
                    and isnull(recip_eeo.Description, '''') = isnull(donor_eeo.Description, '''')
                    and isnull(recip_eeo.Priority, 0) = isnull(donor_eeo.Priority, 0)
                    and isnull(recip_eeo.Active, 0) = isnull(donor_eeo.Active, 0)

                left join '+trim(@cDonorTablePath)+'PayType donor_payt on donor_eo.COMP_PayTypeID = donor_payt.ID
                left join '+trim(@cRecipientTablePath)+'PayType recip_payt on recip_payt.CompanyID = '+@cRecipientCompany_ID+'
                    and isnull(recip_payt.Code, '''') = isnull(donor_payt.Code, '''')
                    and isnull(recip_payt.Description, '''') = isnull(donor_payt.Description, '''')
                    and isnull(recip_payt.Priority, 0) = isnull(donor_payt.Priority, 0)
                    and isnull(recip_payt.Active, 0) = isnull(donor_payt.Active, 0)

                left join '+trim(@cDonorTablePath)+'FrequencyType donor_ft on donor_eo.COMP_FrequencyTypeID = donor_ft.ID
                left join '+trim(@cRecipientTablePath)+'FrequencyType recip_ft on recip_ft.CompanyID = '+@cRecipientCompany_ID+'
                    and isnull(recip_ft.Code, '''') = isnull(donor_ft.Code, '''')
                    and isnull(recip_ft.Description, '''') = isnull(donor_ft.Description, '''')
                    and isnull(recip_ft.Priority, 0) = isnull(donor_ft.Priority, 0)
                    and isnull(recip_ft.Active, 0) = isnull(donor_ft.Active, 0)
                    and isnull(recip_ft.PaysPerYear, 0) = isnull(donor_ft.PaysPerYear, 0)

                left join '+trim(@cDonorTablePath)+'CompensationChangeReason donor_ccr on donor_eo.COMP_CompensationChangeReasonID = donor_ccr.ID
                left join '+trim(@cRecipientTablePath)+'CompensationChangeReason recip_ccr on recip_ccr.CompanyID = '+@cRecipientCompany_ID+'
                    and isnull(recip_ccr.Code, '''') = isnull(donor_ccr.Code, '''')
                    and isnull(recip_ccr.Description, '''') = isnull(donor_ccr.Description, '''')
                    and isnull(recip_ccr.Priority, 0) = isnull(donor_ccr.Priority, 0)
                    and isnull(recip_ccr.Active, 0) = isnull(donor_ccr.Active, 0)

                left join '+trim(@cDonorTablePath)+'BenefitClass donor_bc on donor_eo.BenefitClassID = donor_bc.ID
                left join '+trim(@cRecipientTablePath)+'BenefitClass recip_bc on recip_bc.CompanyID = '+@cRecipientCompany_ID+'
                    and isnull(recip_bc.Code, '''') = isnull(donor_bc.Code, '''')
                    and isnull(recip_bc.Description, '''') = isnull(donor_bc.Description, '''')
                    and isnull(recip_bc.Priority, 0) = isnull(donor_bc.Priority, 0)
                    and isnull(recip_bc.Active, 0) = isnull(donor_bc.Active, 0)

                left join '+trim(@cDonorTablePath)+'Employee donor_sup1 on donor_sup1.ID = donor_eo.EPO_Supervisor1ID
                left join '+trim(@cRecipientTablePath)+'Employee recip_sup1 on recip_sup1.EmployeeCode = donor_sup1.EmployeeCode and recip_sup1.CompanyID = '+@cRecipientCompany_ID+'

                left join '+trim(@cDonorTablePath)+'Employee donor_sup2 on donor_sup2.ID = donor_eo.EPO_Supervisor2ID
                left join '+trim(@cRecipientTablePath)+'Employee recip_sup2 on recip_sup2.EmployeeCode = donor_sup2.EmployeeCode and recip_sup2.CompanyID = '+@cRecipientCompany_ID+'

                left join '+trim(@cDonorTablePath)+'Employee donor_sup3 on donor_sup3.ID = donor_eo.EPO_Supervisor3ID
                left join '+trim(@cRecipientTablePath)+'Employee recip_sup3 on recip_sup3.EmployeeCode = donor_sup3.EmployeeCode and recip_sup3.CompanyID = '+@cRecipientCompany_ID+'

                left join '+trim(@cDonorTablePath)+'HRnextUser donor_user on donor_user.ID = donor_eo.USER_HRnextUserID
                left join '+trim(@cRecipientTablePath)+'HRnextUser recip_user on recip_user.username = donor_user.username
                
                left join '+trim(@cDonorTablePath)+'ATApplication donor_ata on donor_ata.ID = donor_eo.ATApplicationID
                left join '+trim(@cRecipientTablePath)+'ATApplication recip_ata
                    on recip_ata.ATApplicationKey = donor_ata.ATApplicationKey
                    and isnull(recip_ata.FirstName, '''') = isnull(donor_eo.FirstName, '''')
					and isnull(recip_ata.LastName, '''') = isnull(donor_eo.LastName, '''')
					and isnull(recip_ata.Address1, '''') = isnull(donor_ata.Address1, '''')
					and isnull(recip_ata.EmailAddress, '''') = isnull(donor_ata.EmailAddress, '''')

                left join '+trim(@cDonorTablePath)+'AutoPayType donor_apt on donor_apt.ID = donor_eo.COMP_AutoPayTypeID
                left join '+trim(@cRecipientTablePath)+'AutoPayType recip_apt
                    on isnull(recip_apt.Code, '''') = isnull(donor_apt.Code, '''')
                    and isnull(recip_apt.Description, '''') = isnull(donor_apt.Description, '''')
                    and isnull(recip_apt.Priority, 0) = isnull(donor_apt.Priority, 0)
                    and isnull(recip_apt.Active, 0) = isnull(donor_apt.Active, 0)

                left join '+trim(@cDonorTablePath)+'CountryStateType donor_bc_dl_cst on donor_bc_dl_cst.ID = donor_eo.BC_DLCountryStateTypeID
                left join '+trim(@cRecipientTablePath)+'CountryStateType recip_bc_dl_cst
                    on isnull(recip_bc_dl_cst.CountryCode, '''') = isnull(donor_bc_dl_cst.CountryCode, '''')
                    and isnull(recip_bc_dl_cst.CountryName, '''') = isnull(donor_bc_dl_cst.CountryName, '''')
                    and isnull(recip_bc_dl_cst.StateCode, '''') = isnull(donor_bc_dl_cst.StateCode, '''')
                    and isnull(recip_bc_dl_cst.StateName, '''') = isnull(donor_bc_dl_cst.StateName, '''')

                left join '+trim(@cDonorTablePath)+'CountryStateType donor_bc_cst on donor_bc_cst.ID = donor_eo.BC_CountryStateTypeID
                left join '+trim(@cRecipientTablePath)+'CountryStateType recip_bc_cst
                    on isnull(recip_bc_cst.CountryCode, '''') = isnull(donor_bc_cst.CountryCode, '''')
                    and isnull(recip_bc_cst.CountryName, '''') = isnull(donor_bc_cst.CountryName, '''')
                    and isnull(recip_bc_cst.StateCode, '''') = isnull(donor_bc_cst.StateCode, '''')
                    and isnull(recip_bc_cst.StateName, '''') = isnull(donor_bc_cst.StateName, '''')

                left join '+trim(@cDonorTablePath)+'CountryStateType donor_cst on donor_cst.ID = donor_eo.CountryStateTypeID
                left join '+trim(@cRecipientTablePath)+'CountryStateType recip_cst
                    on isnull(recip_cst.CountryCode, '''') = isnull(donor_cst.CountryCode, '''')
                    and isnull(recip_cst.CountryName, '''') = isnull(donor_cst.CountryName, '''')
                    and isnull(recip_cst.StateCode, '''') = isnull(donor_cst.StateCode, '''')
                    and isnull(recip_cst.StateName, '''') = isnull(donor_cst.StateName, '''')

                left join '+trim(@cDonorTablePath)+'CountryStateType donor_ec_cst on donor_ec_cst.ID = donor_eo.EC_CountryStateTypeID
                left join '+trim(@cRecipientTablePath)+'CountryStateType recip_ec_cst
                    on isnull(recip_ec_cst.CountryCode, '''') = isnull(donor_ec_cst.CountryCode, '''')
                    and isnull(recip_ec_cst.CountryName, '''') = isnull(donor_ec_cst.CountryName, '''')
                    and isnull(recip_ec_cst.StateCode, '''') = isnull(donor_ec_cst.StateCode, '''')
                    and isnull(recip_ec_cst.StateName, '''') = isnull(donor_ec_cst.StateName, '''')

                left join '+trim(@cDonorTablePath)+'EducationLevelType donor_elt on donor_elt.ID = donor_eo.EducationLevelTypeID
                left join '+trim(@cRecipientTablePath)+'EducationLevelType recip_elt
                    on isnull(recip_elt.Code, '''') = isnull(donor_elt.Code, '''')
                    and isnull(recip_elt.Description, '''') = isnull(donor_elt.Description, '''')
                    and isnull(recip_elt.Priority, 0) = isnull(donor_elt.Priority, 0)
                    and isnull(recip_elt.Active, 0) = isnull(donor_elt.Active, 0)
                
                left join '+trim(@cDonorTablePath)+'EthnicityType donor_etht on donor_eo.EthnicityTypeID = donor_etht.ID
                left join '+trim(@cRecipientTablePath)+'EthnicityType recip_etht on recip_etht.CompanyID = '+@cRecipientCompany_ID+'
                    and isnull(recip_etht.Code, '''') = isnull(donor_etht.Code, '''')
                    and isnull(recip_etht.Description, '''') = isnull(donor_etht.Description, '''')
                    and isnull(recip_etht.Priority, 0) = isnull(donor_etht.Priority, 0)
                    and isnull(recip_etht.Active, 0) = isnull(donor_etht.Active, 0)

                left join '+trim(@cDonorTablePath)+'GenderType donor_gt on donor_gt.ID = donor_eo.GenderTypeID
                left join '+trim(@cRecipientTablePath)+'GenderType recip_gt
                    on isnull(recip_gt.Code, '''') = isnull(donor_gt.Code, '''')
                    and isnull(recip_gt.Description, '''') = isnull(donor_gt.Description, '''')
                    and isnull(recip_gt.Priority, 0) = isnull(donor_gt.Priority, 0)
                    and isnull(recip_gt.Active, 0) = isnull(donor_gt.Active, 0)

                left join '+trim(@cDonorTablePath)+'MaritalStatusType donor_mst on donor_mst.ID = donor_eo.MaritalStatusTypeID
                left join '+trim(@cRecipientTablePath)+'MaritalStatusType recip_mst
                    on isnull(recip_mst.Code, '''') = isnull(donor_mst.Code, '''')
                    and isnull(recip_mst.Description, '''') = isnull(donor_mst.Description, '''')
                    and isnull(recip_mst.Priority, 0) = isnull(donor_mst.Priority, 0)
                    and isnull(recip_mst.Active, 0) = isnull(donor_mst.Active, 0)

                left join '+trim(@cDonorTablePath)+'TaxFormType donor_tft on donor_tft.ID = donor_eo.TaxFormTypeID
                left join '+trim(@cRecipientTablePath)+'TaxFormType recip_tft
                    on isnull(recip_tft.Code, '''') = isnull(donor_tft.Code, '''')
                    and isnull(recip_tft.Description, '''') = isnull(donor_tft.Description, '''')
                    and isnull(recip_tft.Priority, 0) = isnull(donor_tft.Priority, 0)
                    and isnull(recip_tft.Active, 0) = isnull(donor_tft.Active, 0)

                left join '+trim(@cDonorTablePath)+'CountryStateType donor_w4_cst on donor_w4_cst.ID = donor_eo.W4_CountryStateTypeID
                left join '+trim(@cRecipientTablePath)+'CountryStateType recip_w4_cst
                    on isnull(recip_w4_cst.CountryCode, '''') = isnull(donor_w4_cst.CountryCode, '''')
                    and isnull(recip_w4_cst.CountryName, '''') = isnull(donor_w4_cst.CountryName, '''')
                    and isnull(recip_w4_cst.StateCode, '''') = isnull(donor_w4_cst.StateCode, '''')
                    and isnull(recip_w4_cst.StateName, '''') = isnull(donor_w4_cst.StateName, '''')

                left join '+trim(@cDonorTablePath)+'CountryStateType donor_hs_cst on donor_hs_cst.ID = donor_eo.HomeStateID_EVO
                left join '+trim(@cRecipientTablePath)+'CountryStateType recip_hs_cst
                    on isnull(recip_hs_cst.CountryCode, '''') = isnull(donor_hs_cst.CountryCode, '''')
                    and isnull(recip_hs_cst.CountryName, '''') = isnull(donor_hs_cst.CountryName, '''')
                    and isnull(recip_hs_cst.StateCode, '''') = isnull(donor_hs_cst.StateCode, '''')
                    and isnull(recip_hs_cst.StateName, '''') = isnull(donor_hs_cst.StateName, '''')

                left join '+trim(@cDonorTablePath)+'FrequencyType donor_ft_evo on donor_eo.FrequencyTypeID_EVO = donor_ft_evo.ID
                left join '+trim(@cRecipientTablePath)+'FrequencyType recip_ft_evo on recip_ft_evo.CompanyID = '+@cRecipientCompany_ID+'
                    and isnull(recip_ft_evo.Code, '''') = isnull(donor_ft_evo.Code, '''')
                    and isnull(recip_ft_evo.Description, '''') = isnull(donor_ft_evo.Description, '''')
                    and isnull(recip_ft_evo.Priority, 0) = isnull(donor_ft_evo.Priority, 0)
                    and isnull(recip_ft_evo.Active, 0) = isnull(donor_ft_evo.Active, 0)
                    and isnull(recip_ft_evo.PaysPerYear, 0) = isnull(donor_ft_evo.PaysPerYear, 0)

                left join '+trim(@cDonorTablePath)+'OnboardingStatusType donor_ost on donor_ost.ID = donor_eo.OnboardingStatusTypeID
                left join '+trim(@cRecipientTablePath)+'OnboardingStatusType recip_ost
                    on isnull(recip_ost.Code, '''') = isnull(donor_ost.Code, '''')
                    and isnull(recip_ost.Description, '''') = isnull(donor_ost.Description, '''')
                    and isnull(recip_ost.Priority, 0) = isnull(donor_ost.Priority, 0)
                    and isnull(recip_ost.Active, 0) = isnull(donor_ost.Active, 0)

               where donor_eo.CompanyID ='+ @cDonorCompany_ID
            exec (@cmdShowDataDonor)
            if @cShowStatement = 1
                begin
                    select @cmdShowDataDonor
                end
            if @cVerbose_Ind = 1
                begin
                    select 'EmployeeOnboard - A' as Showdata
                end
	    end

    end

	-- ------------------------------------------------------------
	-- These Queries determine wether an insert should continue
	if @nDonorExistCount = 0 
		select @cFailCodes = 'NoDonorExists', @cValidateType_Cd = 'ExitPGM'
	if @nRecipientExistCount > 0 
		select @cFailCodes = 'RecipientExists', @cValidateType_Cd = 'ExitPGM'

	-- This Query loads the data from Donor
	if @cValidateType_Cd = 'Insert'
	
	begin

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%A%'
		begin
			select @cmdInsert = 'insert into '+trim(@cRecipientTablePath)+'EmployeeOnboard (CompanyID, EmployeeCode, FirstName, LastName, MiddleName, Prefix, Suffix, NickName, CompanyName, Address1, Address2, City, CountryStateTypeID, Zip, EmailAddress, PhoneHome, PhoneWork, PhoneCell, BirthDate, SSN, AlternateTaxNumber, ClockNumber, OB_HireDate, TaxFormTypeID, EducationLevelTypeID, GenderTypeID, MaritalStatusTypeID, EthnicityTypeID, EPO_Org1ID, EPO_Org2ID, EPO_Org3ID, EPO_Org4ID, EPO_Org5ID, EPO_Supervisor1ID, EPO_Supervisor2ID, EPO_Supervisor3ID, EPO_PositionTypeID, EPO_EmploymentTypeID, EPO_StatusTypeID, EPO_PositionOrganizationChangeReasonID, EPO_WorkerCompTypeID, EPO_PayGroupTypeID, EPO_EEOTypeID, COMP_PayTypeID, COMP_FrequencyTypeID, COMP_AutoPayTypeID, COMP_Rate, COMP_DefaultHours, EC_ContactType, EC_FirstName, EC_MiddleName, EC_LastName, EC_Address1, EC_Address2, EC_City, EC_CountryStateTypeID, EC_Zip, EC_EmailAddress, EC_PhoneHome, EC_PhoneWork, EC_PhoneCell, TAX_FITW_FilingStatusID, TAX_FITW_Exemptions1, TAX_FITW_Exemptions2, TAX_SITW_StateID, TAX_SITW_FilingStatusID, TAX_SITW_Exemptions1, TAX_SITW_Exemptions2, TAX_SITW_Percentage, TAX_SUI_StateID, TAX_LOC1_TaxCodeID, TAX_LOC1_FilingStatusID, TAX_LOC1_Exemptions1, TAX_LOC1_Exemptions2, TAX_LOC2_TaxCodeID, TAX_LOC2_FilingStatusID, TAX_LOC2_Exemptions1, TAX_LOC2_Exemptions2, TAX_LOC3_TaxCodeID, TAX_LOC3_FilingStatusID, TAX_LOC3_Exemptions1, TAX_LOC3_Exemptions2, TAX_LOC4_TaxCodeID, TAX_LOC4_FilingStatusID, TAX_LOC4_Exemptions1, TAX_LOC4_Exemptions2, TAX_LOC5_TaxCodeID, TAX_LOC5_FilingStatusID, TAX_LOC5_Exemptions1, TAX_LOC5_Exemptions2, USER_HRnextUserID, TAX_WorkStateID, USER_NewUserSendWelcome, COMP_CompensationChangeReasonID, OnboardingStatusTypeID, OB_Key, OB_Step1Date, OB_Step2Date, OB_Step3Date, OB_Step4Date, OB_Step5Date, OB_Step1Username, OB_Step5Username, OnboardingTaskListID, DD_1_Priority, DD_1_RoutingNumber, DD_1_Account, DD_1_Checking, DD_1_AmountCode, DD_1_Amount, DD_1_ExcludeSpecial, DD_1_PreNoteDate, DD_1_NameOnAccount, DD_1_StartDate, DD_1_EndDate, DD_2_Priority, DD_2_RoutingNumber, DD_2_Account, DD_2_Checking, DD_2_AmountCode, DD_2_Amount, DD_2_ExcludeSpecial, DD_2_PreNoteDate, DD_2_NameOnAccount, DD_2_StartDate, DD_2_EndDate, DD_3_Priority, DD_3_RoutingNumber, DD_3_Account, DD_3_Checking, DD_3_AmountCode, DD_3_Amount, DD_3_ExcludeSpecial, DD_3_PreNoteDate, DD_3_NameOnAccount, DD_3_StartDate, DD_3_EndDate, DD_EsignName, DD_EsignStamptedDateTime, I9_SEC1_FirstName, I9_SEC1_LastName, I9_SEC1_MiddleInitial, I9_SEC1_OtherNamesUsed, I9_SEC1_Address1, I9_SEC1_City, I9_SEC1_Zip, I9_SEC1_SSN, I9_SEC1_DOB, I9_SEC1_EmailAddress, I9_SEC1_PhoneHome, I9_SEC1_IsUSCitizen, I9_SEC1_IsUSNonCitizenNational, I9_SEC1_IsUSPR, I9_SEC1_IsAlien, I9_SEC1_PRUSCISNumber, I9_SEC1_AlienWorkExpirationDate, I9_SEC1_AlienUSCISNumber, I9_SEC1_AlienI94Number, I9_SEC1_AlienForeignPassportNumber, I9_SEC1_AlienCountryOfIssuance, I9_SEC1_EsignName, I9_SEC1_EsignFormDate, I9_SEC1_EsignStamptedDateTime, BC_FullLegalName, BC_OtherNamesUsed, BC_Address1, BC_City, BC_CountryStateTypeID, BC_Zip, BC_SSN, BC_DOB, BC_DLName, BC_DLNumber, BC_DLCountryStateTypeID, BC_EsignName, BC_EsignFormDate, BC_EsignStamptedDateTime, CD_EsignName, CD_EsignStamptedDateTime, ATApplicationID, W4_BOX1_FirstName, W4_BOX1_LastName, W4_BOX1_MiddleInitial, W4_BOX1_Address1, W4_BOX1_City, W4_BOX1_CountryStateTypeID, W4_BOX1_Zip, W4_BOX2_SSN, W4_BOX3_IsSingle, W4_BOX3_IsMarried, W4_BOX3_IsMarriedButWHAtHigherSingleRate, W4_BOX4_IsNameDifferentFromSSCard, W4_BOX5_TotalAllowances, W4_Box6_AdditionalAmountWH, W4_BOX7_IsExempt, W4_BOX7_ExemptText, W4_EsignName, W4_EsignFormDate, W4_EsignStamptedDateTime, TAX_FITW_AdditionalAmount, EPO_AlternateSupervisor, TC_SC_Excluded, TC_SC_Options, TC_SC_ExportBlock, TC_SC_WebClockEnabled, TC_SC_MobileEnabled, TC_SC_MobilePunchEnabled, TC_SC_GeoDataEnabled, TC_SC_EnforceSchedule, UD_Memo1, UD_Memo2, UD_Memo3, I9_SEC1_Apartment, I9_SEC1_Prep_FirstName, I9_SEC1_Prep_LastName, I9_SEC1_Prep_Address1, I9_SEC1_Prep_City, I9_SEC1_Prep_Zip, I9_SEC1_Prep_IsPreparer, I9_SEC1_Prep_EsignName, I9_SEC1_Prep_EsignFormDate, I9_SEC1_Prep_EsignStamptedDateTime, I9_SEC1_PRAlienRegNumber, I9_SEC1_AlienAlienRegNumber, I9_SEC1_Prep_CountryStateTypeCode, I9_SEC1_CountryStateTypeCode, EndNote_EsignName, EndNote_EsignStamptedDateTime, CustomDocumentUpload_EsignName, CustomDocumentUpload_EsignStamptedDateTime, IsVetStatus_Disabled, IsVetStatus_RecentlySeparated, IsVetStatus_ActiveDutyWartime, IsVetStatus_AFServiceMedal, VetStatus_DischargeDate, VetStatus_MilitaryReserve, VetStatus_Veteran, IsVetStatus_VietnamEra, IsVetStatus_Other, TAX_EVO_Fed_MaritalStatus, TAX_EVO_Fed_Exemptions, TAX_EVO_Fed_TaxType, TAX_EVO_Fed_AdditionalAmount, TAX_EVO_Fed_TaxStatus, TAX_EVO_State_WorkState, TAX_EVO_State_SUIState, TAX_EVO_State_SDIState, TAX_EVO_State_MaritalStatus, TAX_EVO_State_Exemptions, TAX_EVO_State_TaxType, TAX_EVO_State_AdditionalAmount, TAX_EVO_State_TaxStatus, EligibleForBenefitsDate_EVO, HomeStateID_EVO, BenefitClassID, FrequencyTypeID_EVO, StandardPayrollHours_EVO, FLSAClassification_EVO, IsEligibleForRehire, MedicalCoverageOffered_EVO, DD_1_IsSavings, DD_1_IsMoneyMarket, DD_2_IsSavings, DD_2_IsMoneyMarket, DD_3_IsSavings, DD_3_IsMoneyMarket, EvoApproveDD1, EvoApproveDD2, EvoApproveDD3, Evo_DD_1_Approval_Status, Evo_DD_2_Approval_Status, Evo_DD_3_Approval_Status, Evo_DD_1_isPrenote, Evo_DD_2_isPrenote, Evo_DD_3_isPrenote, Evo_DD_1_deductionCode, Evo_DD_2_deductionCode, Evo_DD_3_deductionCode, IsEIN1099Employee, PayGroup_EVO, AccrualGroup_TLM, IsSupervisor_TLM, Supervisor_TLM, W4_FirstName, W4_LastName, W4_MiddleInitial, W4_Address1, W4_City, W4_CountryStateTypeID, W4_Zip, W4_SSN, W4_MaritalStatus, W4_HigherRate, W4_DependentsUnderSeventeen, W4_OtherDependents, W4_OtherIncome, W4_AdditionalDeductions, W4_ExtraWithholding, W4_Exempt, W4_OtherTaxCredits, CompanyJobID_EVO)
            select
                '+@cRecipientCompany_ID+' as CompanyID,
                donor_eo.EmployeeCode,
                donor_eo.FirstName,
                donor_eo.LastName,
                donor_eo.MiddleName,
                donor_eo.Prefix,
                donor_eo.Suffix,
                donor_eo.NickName,
                donor_eo.CompanyName,
                donor_eo.Address1,
                donor_eo.Address2,
                donor_eo.City,
                recip_cst.ID as CountryStateTypeID,
                donor_eo.Zip,
                donor_eo.EmailAddress,
                donor_eo.PhoneHome,
                donor_eo.PhoneWork,
                donor_eo.PhoneCell,
                donor_eo.BirthDate,
                donor_eo.SSN,
                donor_eo.AlternateTaxNumber,
                donor_eo.ClockNumber,
                donor_eo.OB_HireDate,
                recip_tft.ID as TaxFormTypeID,
                recip_elt.ID as EducationLevelTypeID,
                recip_gt.ID as GenderTypeID,
                recip_mst.ID as MaritalStatusTypeID,
                recip_etht.ID as EthnicityTypeID,
                recipDiv1.ID as EPO_Org1ID,
                recipBranch2.ID as EPO_Org2ID,
                recipDep3.ID as EPO_Org3ID,
                recipTeam4.ID as EPO_Org4ID,
                NULL as EPO_Org5ID,
                recip_sup1.ID as EPO_Supervisor1ID,
                recip_sup2.ID as EPO_Supervisor2ID,
                recip_sup3.ID as EPO_Supervisor3ID,
                recip_pt.ID as EPO_PositionTypeID,
                recip_et.ID as EPO_EmploymentTypeID,
                recip_st.ID as EPO_StatusTypeID,
                recip_pocr.ID as EPO_PositionOrganizationChangeReasonID,
                recip_wct.ID as EPO_WorkerCompTypeID,
                recip_pgt.ID as EPO_PayGroupTypeID,
                recip_eeo.ID as EPO_EEOTypeID,
                recip_payt.ID as COMP_PayTypeID,
                recip_ft.ID as COMP_FrequencyTypeID,
                recip_apt.ID as COMP_AutoPayTypeID,
                donor_eo.COMP_Rate,
                donor_eo.COMP_DefaultHours,
                donor_eo.EC_ContactType,
                donor_eo.EC_FirstName,
                donor_eo.EC_MiddleName,
                donor_eo.EC_LastName,
                donor_eo.EC_Address1,
                donor_eo.EC_Address2,
                donor_eo.EC_City,
                recip_ec_cst.ID as EC_CountryStateTypeID,
                donor_eo.EC_Zip,
                donor_eo.EC_EmailAddress,
                donor_eo.EC_PhoneHome,
                donor_eo.EC_PhoneWork,
                donor_eo.EC_PhoneCell,
                donor_eo.TAX_FITW_FilingStatusID,
                donor_eo.TAX_FITW_Exemptions1,
                donor_eo.TAX_FITW_Exemptions2,
                donor_eo.TAX_SITW_StateID,
                donor_eo.TAX_SITW_FilingStatusID,
                donor_eo.TAX_SITW_Exemptions1,
                donor_eo.TAX_SITW_Exemptions2,
                donor_eo.TAX_SITW_Percentage,
                donor_eo.TAX_SUI_StateID,
                donor_eo.TAX_LOC1_TaxCodeID,
                donor_eo.TAX_LOC1_FilingStatusID,
                donor_eo.TAX_LOC1_Exemptions1,
                donor_eo.TAX_LOC1_Exemptions2,
                donor_eo.TAX_LOC2_TaxCodeID,
                donor_eo.TAX_LOC2_FilingStatusID,
                donor_eo.TAX_LOC2_Exemptions1,
                donor_eo.TAX_LOC2_Exemptions2,
                donor_eo.TAX_LOC3_TaxCodeID,
                donor_eo.TAX_LOC3_FilingStatusID,
                donor_eo.TAX_LOC3_Exemptions1,
                donor_eo.TAX_LOC3_Exemptions2,
                donor_eo.TAX_LOC4_TaxCodeID,
                donor_eo.TAX_LOC4_FilingStatusID,
                donor_eo.TAX_LOC4_Exemptions1,
                donor_eo.TAX_LOC4_Exemptions2,
                donor_eo.TAX_LOC5_TaxCodeID,
                donor_eo.TAX_LOC5_FilingStatusID,
                donor_eo.TAX_LOC5_Exemptions1,
                donor_eo.TAX_LOC5_Exemptions2,
                recip_user.ID as USER_HRnextUserID,
                donor_eo.TAX_WorkStateID,
                donor_eo.USER_NewUserSendWelcome,
                recip_ccr.ID as COMP_CompensationChangeReasonID,
                recip_ost.ID as OnboardingStatusTypeID,
                donor_eo.OB_Key,
                donor_eo.OB_Step1Date,
                donor_eo.OB_Step2Date,
                donor_eo.OB_Step3Date,
                donor_eo.OB_Step4Date,
                donor_eo.OB_Step5Date,
                donor_eo.OB_Step1UserName,
                donor_eo.OB_Step5UserName,
                recip_otl.ID as OnboardingTaskListID,
                donor_eo.DD_1_Priority,
                donor_eo.DD_1_RoutingNumber,
                donor_eo.DD_1_Account,
                donor_eo.DD_1_Checking,
                donor_eo.DD_1_AmountCode,
                donor_eo.DD_1_Amount,
                donor_eo.DD_1_ExcludeSpecial,
                donor_eo.DD_1_PreNoteDate,
                donor_eo.DD_1_NameOnAccount,
                donor_eo.DD_1_StartDate,
                donor_eo.DD_1_EndDate,
                donor_eo.DD_2_Priority,
                donor_eo.DD_2_RoutingNumber,
                donor_eo.DD_2_Account,
                donor_eo.DD_2_Checking,
                donor_eo.DD_2_AmountCode,
                donor_eo.DD_2_Amount,
                donor_eo.DD_2_ExcludeSpecial,
                donor_eo.DD_2_PreNoteDate,
                donor_eo.DD_2_NameOnAccount,
                donor_eo.DD_2_StartDate,
                donor_eo.DD_2_EndDate,
                donor_eo.DD_3_Priority,
                donor_eo.DD_3_RoutingNumber,
                donor_eo.DD_3_Account,
                donor_eo.DD_3_Checking,
                donor_eo.DD_3_AmountCode,
                donor_eo.DD_3_Amount,
                donor_eo.DD_3_ExcludeSpecial,
                donor_eo.DD_3_PreNoteDate,
                donor_eo.DD_3_NameOnAccount,
                donor_eo.DD_3_StartDate,
                donor_eo.DD_3_EndDate,
                donor_eo.DD_EsignName,
                donor_eo.DD_EsignStamptedDateTime,
                donor_eo.I9_SEC1_FirstName,
                donor_eo.I9_SEC1_LastName,
                donor_eo.I9_SEC1_MiddleInitial,
                donor_eo.I9_SEC1_OtherNamesUsed,
                donor_eo.I9_SEC1_Address1,
                donor_eo.I9_SEC1_City,
                donor_eo.I9_SEC1_Zip,
                donor_eo.I9_SEC1_SSN,
                donor_eo.I9_SEC1_DOB,
                donor_eo.I9_SEC1_EmailAddress,
                donor_eo.I9_SEC1_PhoneHome,
                donor_eo.I9_SEC1_IsUSCitizen,
                donor_eo.I9_SEC1_IsUSNonCitizenNational,
                donor_eo.I9_SEC1_IsUSPR,
                donor_eo.I9_SEC1_IsAlien,
                donor_eo.I9_SEC1_PRUSCISNumber,
                donor_eo.I9_SEC1_AlienWorkExpirationDate,
                donor_eo.I9_SEC1_AlienUSCISNumber,
                donor_eo.I9_SEC1_AlienI94Number,
                donor_eo.I9_SEC1_AlienForeignPassportNumber,
                donor_eo.I9_SEC1_AlienCountryOfIssuance,
                donor_eo.I9_SEC1_EsignName,
                donor_eo.I9_SEC1_EsignFormDate,
                donor_eo.I9_SEC1_EsignStamptedDateTime,
                donor_eo.BC_FullLegalName,
                donor_eo.BC_OtherNamesUsed,
                donor_eo.BC_Address1,
                donor_eo.BC_City,
                recip_bc_cst.ID as BC_CountryStateTypeID,
                donor_eo.BC_Zip,
                donor_eo.BC_SSN,
                donor_eo.BC_DOB,
                donor_eo.BC_DLName,
                donor_eo.BC_DLNumber,
                recip_bc_dl_cst.ID as BC_DLCountryStateTypeID,
                donor_eo.BC_EsignName,
                donor_eo.BC_EsignFormDate,
                donor_eo.BC_EsignStamptedDateTime,
                donor_eo.CD_EsignName,
                donor_eo.CD_EsignStamptedDateTime,
                recip_ata.ID as ATApplicationID,
                donor_eo.W4_BOX1_FirstName,
                donor_eo.W4_BOX1_LastName,
                donor_eo.W4_BOX1_MiddleInitial,
                donor_eo.W4_BOX1_Address1,
                donor_eo.W4_BOX1_City,
                donor_eo.W4_BOX1_CountryStateTypeID,
                donor_eo.W4_BOX1_Zip,
                donor_eo.W4_BOX2_SSN,
                donor_eo.W4_BOX3_IsSingle,
                donor_eo.W4_BOX3_IsMarried,
                donor_eo.W4_BOX3_IsMarriedButWHAtHigherSingleRate,
                donor_eo.W4_BOX4_IsNameDifferentFromSSCard,
                donor_eo.W4_BOX5_TotalAllowances,
                donor_eo.W4_BOX6_AdditionalAmountWH,
                donor_eo.W4_BOX7_IsExempt,
                donor_eo.W4_BOX7_ExemptText,
                donor_eo.W4_EsignName,
                donor_eo.W4_EsignFormDate,
                donor_eo.W4_EsignStamptedDateTime,
                donor_eo.TAX_FITW_AdditionalAmount,
                donor_eo.EPO_AlternateSupervisor,
                donor_eo.TC_SC_Excluded,
                donor_eo.TC_SC_Options,
                donor_eo.TC_SC_ExportBlock,
                donor_eo.TC_SC_WebClockEnabled,
                donor_eo.TC_SC_MobileEnabled,
                donor_eo.TC_SC_MobilePunchEnabled,
                donor_eo.TC_SC_GeoDataEnabled,
                donor_eo.TC_SC_EnforceSchedule,
                donor_eo.UD_Memo1,
                donor_eo.UD_Memo2,
                donor_eo.UD_Memo3,
                donor_eo.I9_SEC1_Apartment,
                donor_eo.I9_SEC1_Prep_FirstName,
                donor_eo.I9_SEC1_Prep_LastName,
                donor_eo.I9_SEC1_Prep_Address1,
                donor_eo.I9_SEC1_Prep_City,
                donor_eo.I9_SEC1_Prep_Zip,
                donor_eo.I9_SEC1_Prep_IsPreparer,
                donor_eo.I9_SEC1_Prep_EsignName,
                donor_eo.I9_SEC1_Prep_EsignFormDate,
                donor_eo.I9_SEC1_Prep_EsignStamptedDateTime,
                donor_eo.I9_SEC1_PRAlienRegNumber,
                donor_eo.I9_SEC1_AlienAlienRegNumber,
                donor_eo.I9_SEC1_Prep_CountryStateTypeCode,
                donor_eo.I9_SEC1_CountryStateTypeCode,
                donor_eo.EndNote_EsignName,
                donor_eo.EndNote_EsignStamptedDateTime,
                donor_eo.CustomDocumentUpload_EsignName,
                donor_eo.CustomDocumentUpload_EsignStamptedDateTime,
                donor_eo.IsVetStatus_Disabled,
                donor_eo.IsVetStatus_RecentlySeparated,
                donor_eo.IsVetStatus_ActiveDutyWartime,
                donor_eo.IsVetStatus_AFServiceMedal,
                donor_eo.VetStatus_DischargeDate,
                donor_eo.VetStatus_MilitaryReserve,
                donor_eo.VetStatus_Veteran,
                donor_eo.IsVetStatus_VietnamEra,
                donor_eo.IsVetStatus_Other,
                donor_eo.TAX_EVO_Fed_MaritalStatus,
                donor_eo.TAX_EVO_Fed_Exemptions,
                donor_eo.TAX_EVO_Fed_TaxType,
                donor_eo.TAX_EVO_Fed_AdditionalAmount,
                donor_eo.TAX_EVO_Fed_TaxStatus,
                donor_eo.TAX_EVO_State_WorkState,
                donor_eo.TAX_EVO_State_SUIState,
                donor_eo.TAX_EVO_State_SDIState,
                donor_eo.TAX_EVO_State_MaritalStatus,
                donor_eo.TAX_EVO_State_Exemptions,
                donor_eo.TAX_EVO_State_TaxType,
                donor_eo.TAX_EVO_State_AdditionalAmount,
                donor_eo.TAX_EVO_State_TaxStatus,
                donor_eo.EligibleForBenefitsDate_EVO,
                recip_hs_cst.ID as HomeStateID_EVO,
                recip_bc.ID as BenefitClassID,
                recip_ft_evo.ID as FrequencyTypeID_EVO,
                donor_eo.StandardPayrollHours_EVO,
                donor_eo.FLSAClassification_EVO,
                donor_eo.IsEligibleForRehire,
                donor_eo.MedicalCoverageOffered_EVO,
                donor_eo.DD_1_IsSavings,
                donor_eo.DD_1_IsMoneyMarket,
                donor_eo.DD_2_IsSavings,
                donor_eo.DD_2_IsMoneyMarket,
                donor_eo.DD_3_IsSavings,
                donor_eo.DD_3_IsMoneyMarket,
                donor_eo.EvoApproveDD1,
                donor_eo.EvoApproveDD2,
                donor_eo.EvoApproveDD3,
                donor_eo.Evo_DD_1_Approval_Status,
                donor_eo.Evo_DD_2_Approval_Status,
                donor_eo.Evo_DD_3_Approval_Status,
                donor_eo.Evo_DD_1_isPrenote,
                donor_eo.Evo_DD_2_isPrenote,
                donor_eo.Evo_DD_3_isPrenote,
                donor_eo.Evo_DD_1_deductionCode,
                donor_eo.Evo_DD_2_deductionCode,
                donor_eo.Evo_DD_3_deductionCode,
                donor_eo.IsEIN1099Employee,
                donor_eo.PayGroup_EVO,
                donor_eo.AccrualGroup_TLM,
                donor_eo.IsSupervisor_TLM,
                donor_eo.Supervisor_TLM,
                donor_eo.W4_FirstName,
                donor_eo.W4_LastName,
                donor_eo.W4_MiddleInitial,
                donor_eo.W4_Address1,
                donor_eo.W4_City,
                recip_w4_cst.ID as W4_CountryStateTypeID,
                donor_eo.W4_Zip,               
                donor_eo.W4_SSN,
                donor_eo.W4_MaritalStatus,
                donor_eo.W4_HigherRate,
                donor_eo.W4_DependentsUnderSeventeen,
                donor_eo.W4_OtherDependents,
                donor_eo.W4_OtherIncome,
                donor_eo.W4_AdditionalDeductions,
                donor_eo.W4_ExtraWithholding,
                donor_eo.W4_Exempt,
                donor_eo.W4_OtherTaxCredits,
                donor_eo.CompanyJobID_EVO

                From '+trim(@cDonorTablePath)+'EmployeeOnboard donor_eo
                join '+trim(@cDonorTablePath)+'OrganizationStructure donor_os1 on donor_os1.CompanyID = donor_eo.CompanyID
                join '+trim(@cRecipientTablePath)+'OrganizationStructure recip_os1 on recip_os1.CompanyID = '+@cRecipientCompany_ID+'
                left join '+trim(@cDonorTablePath)+'OrganizationType donorDiv1 on ISNULL(donor_eo.EPO_Org1ID, 0) = ISNULL(donorDiv1.ID, 0)
                left join '+trim(@cRecipientTablePath)+'OrganizationType recipDiv1 on
                recipDiv1.OrganizationStructureID = recip_os1.ID and
                recipDiv1.Code = donorDiv1.Code and
                recipDiv1.Org1ParentID is null

                join '+trim(@cDonorTablePath)+'OrganizationStructure donor_os2 on donor_os2.CompanyID = donor_eo.CompanyID
                join '+trim(@cRecipientTablePath)+'OrganizationStructure recip_os2 on recip_os2.CompanyID = '+@cRecipientCompany_ID+'
                left join '+trim(@cDonorTablePath)+'OrganizationType donorBranch2 on ISNULL(donorBranch2.ID, 0) = ISNULL(donor_eo.EPO_Org2ID, 0)
                left join '+trim(@cDonorTablePath)+'OrganizationType donorDiv2 on donorDiv2.ID = donorBranch2.Org1ParentID
                left join '+trim(@cRecipientTablePath)+'OrganizationType recipDiv2 on
                    recipDiv2.OrganizationStructureID = recip_os2.ID and
                    recipDiv2.Code = donorDiv2.Code and
                    recipDiv2.Org1ParentID is null
                left join '+trim(@cRecipientTablePath)+'OrganizationType recipBranch2 on
                    recipBranch2.OrganizationStructureID = recip_os2.ID and
                    recipBranch2.Code = donorBranch2.Code and
                    recipBranch2.Org1ParentID = recipDiv2.ID and
                    recipBranch2.Org2ParentID is null

                join '+trim(@cDonorTablePath)+'OrganizationStructure donor_os3 on donor_os3.CompanyID = donor_eo.CompanyID
                join '+trim(@cRecipientTablePath)+'OrganizationStructure recip_os3 on recip_os3.CompanyID = '+@cRecipientCompany_ID+'
                left join '+trim(@cDonorTablePath)+'OrganizationType donorDep3 on donorDep3.ID = donor_eo.EPO_Org3ID
                left join '+trim(@cDonorTablePath)+'OrganizationType donorBranch3 on donorBranch3.ID = donorDep3.Org2ParentID
                left join '+trim(@cDonorTablePath)+'OrganizationType donorDiv3 on donorDiv3.ID = donorDep3.Org1ParentID
                left join '+trim(@cRecipientTablePath)+'OrganizationType recipDiv3 on
                    recipDiv3.OrganizationStructureID = recip_os3.ID and
                    recipDiv3.Code = donorDiv3.Code and
                    recipDiv3.Org1ParentID is null
                left join '+trim(@cRecipientTablePath)+'OrganizationType recipBranch3 on
                    recipBranch3.OrganizationStructureID = recip_os3.ID and
                    recipBranch3.Code = donorBranch3.Code and
                    recipBranch3.Org1ParentID = recipDiv3.ID and
                    recipBranch3.Org2ParentID is null
                left join '+trim(@cRecipientTablePath)+'OrganizationType recipDep3 on
                    recipDep3.OrganizationStructureID = recip_os3.ID and
                    recipDep3.Code = donorDep3.Code and
                    recipDep3.Org2ParentID = recipBranch3.ID and
                    recipDep3.Org1ParentID = recipDiv3.ID and
                    recipDep3.Org3ParentID is null

                join '+trim(@cDonorTablePath)+'OrganizationStructure donor_os4 on donor_os4.CompanyID = donor_eo.CompanyID
                join '+trim(@cRecipientTablePath)+'OrganizationStructure recip_os4 on recip_os4.CompanyID = '+@cRecipientCompany_ID+'
                left join '+trim(@cDonorTablePath)+'OrganizationType donorTeam4 on donorTeam4.ID = donor_eo.EPO_Org4ID
                left join '+trim(@cDonorTablePath)+'OrganizationType donorDep4 on donorDep4.ID = donorTeam4.Org3ParentID
                left join '+trim(@cDonorTablePath)+' OrganizationType donorBranch4 on donorBranch4.ID = donorTeam4.Org2ParentID
                left join '+trim(@cDonorTablePath)+'OrganizationType donorDiv4 on donorDiv4.ID = donorTeam4.Org1ParentID
                left join '+trim(@cRecipientTablePath)+'OrganizationType recipDiv4 on
                    recipDiv4.OrganizationStructureID = recip_os4.ID and
                    recipDiv4.Code = donorDiv4.Code and
                    recipDiv4.Org1ParentID is null
                left join '+trim(@cRecipientTablePath)+'OrganizationType recipBranch4 on
                    recipBranch4.OrganizationStructureID = recip_os4.ID and
                    recipBranch4.Code = donorBranch4.Code and
                    recipBranch4.Org1ParentID = recipDiv4.ID and
                    recipBranch4.Org2ParentID is null
                left join '+trim(@cRecipientTablePath)+'OrganizationType recipDep4 on
                    recipDep4.OrganizationStructureID = recip_os4.ID and
                    recipDep4.Code = donorDep4.Code and
                    recipDep4.Org2ParentID = recipBranch4.ID and
                    recipDep4.Org1ParentID = recipDiv4.ID and
                    recipDep4.Org3ParentID is null
                left join '+trim(@cRecipientTablePath)+'OrganizationType recipTeam4 on
                    recipTeam4.OrganizationStructureID = recip_os4.ID and
                    recipTeam4.Code = donorTeam4.Code and
                    recipTeam4.Org3ParentID = recipDep4.ID and
                    recipTeam4.Org2ParentID = recipBranch4.ID and
                    recipTeam4.Org1ParentID = recipDiv4.ID and
                    recipTeam4.Org4ParentID is null

                left join '+trim(@cDonorTablePath)+'StatusType donor_st on donor_eo.EPO_StatusTypeID = donor_st.ID
                left join '+trim(@cRecipientTablePath)+'StatusType recip_st on recip_st.CompanyID = '+@cRecipientCompany_ID+'
                    and isnull(recip_st.Code, '''') = isnull(donor_st.Code, '''')
                    and isnull(recip_st.Description, '''') = isnull(donor_st.Description, '''')
                    and isnull(recip_st.Priority, 0) = isnull(donor_st.Priority, 0)
                    and isnull(recip_st.Active, 0) = isnull(donor_st.Active, 0)
                    and isnull(recip_st.IndicatesActiveEmployee, 0) = isnull(donor_st.IndicatesActiveEmployee, 0)

                left join '+trim(@cDonorTablePath)+'PositionType donor_pt on donor_eo.EPO_PositionTypeID = donor_pt.ID
                left join '+trim(@cRecipientTablePath)+'PositionType recip_pt on recip_pt.CompanyID = '+@cRecipientCompany_ID+'
                    and isnull(recip_pt.Code, '''') = isnull(donor_pt.Code, '''')
                    and isnull(recip_pt.Title, '''') = isnull(donor_pt.Title, '''')
                    and isnull(recip_pt.Priority, 0) = isnull(donor_pt.Priority, 0)
                    and isnull(recip_pt.Active, 0) = isnull(donor_pt.Active, 0)
                    and coalesce(convert(nvarchar(255), recip_pt.ApprovedDate), '''') = coalesce(convert(nvarchar(255), donor_pt.ApprovedDate), '''')
                    and coalesce(convert(nvarchar(255), recip_pt.EffectiveDate), '''') = coalesce(convert(nvarchar(255), donor_pt.EffectiveDate), '''')
                    and coalesce(convert(nvarchar(255), recip_pt.ClosedDate), '''') = coalesce(convert(nvarchar(255), donor_pt.ClosedDate), '''')
                    and isnull(recip_pt.IsBudgeted, 0) = isnull(donor_pt.IsBudgeted, 0)
                    and isnull(recip_pt.FTE, 0) = isnull(donor_pt.FTE, 0)
                    and isnull(recip_pt.Description, '''') = isnull(donor_pt.Description, '''')
                    and isnull(recip_pt.IsOTExempt, 0) = isnull(donor_pt.IsOTExempt, 0)
                    and isnull(recip_pt.PR_Integration_PK, -1) = isnull(donor_pt.PR_Integration_PK, -1)

                left join '+trim(@cDonorTablePath)+'OnboardingTaskList donor_otl on donor_eo.OnboardingTaskListID = donor_otl.ID
                left join '+trim(@cRecipientTablePath)+'OnboardingTaskList recip_otl on donor_eo.CompanyID = '+@cRecipientCompany_ID+'
                    and isnull(recip_otl.Title, '''') = isnull(donor_otl.Title, '''')
                    and isnull(recip_otl.Description, '''') = isnull(donor_otl.Description, '''')
                    and isnull(recip_otl.WelcomeNote, '''') = isnull(donor_otl.WelcomeNote, '''')
                    and isnull(recip_otl.EndNote, '''') = isnull(donor_otl.EndNote, '''')
                    and isnull(recip_otl.CustomDocumentUploadNote, '''') = isnull(donor_otl.CustomDocumentUploadNote, 0)

                left join '+trim(@cDonorTablePath)+'EmploymentType donor_et on donor_eo.EPO_EmploymentTypeID = donor_et.ID
                left join '+trim(@cRecipientTablePath)+'EmploymentType recip_et on recip_et.CompanyID = '+@cRecipientCompany_ID+'
                    and isnull(recip_et.Code, '''') = isnull(donor_et.Code, '''')
                    and isnull(recip_et.Description, '''') = isnull(donor_et.Description, '''')
                    and isnull(recip_et.Priority, 0) = isnull(donor_et.Priority, 0)
                    and isnull(recip_et.Active, 0) = isnull(donor_et.Active, 0)

                left join '+trim(@cDonorTablePath)+'PositionOrganizationChangeReason donor_pocr on donor_eo.EPO_PositionOrganizationChangeReasonID = donor_pocr.ID
                left join '+trim(@cRecipientTablePath)+'PositionOrganizationChangeReason recip_pocr on recip_pocr.CompanyID = '+@cRecipientCompany_ID+'
                    and isnull(recip_pocr.Code, '''') = isnull(donor_pocr.Code, '''')
                    and isnull(recip_pocr.Description, '''') = isnull(donor_pocr.Description, '''')
                    and isnull(recip_pocr.Priority, 0) = isnull(donor_pocr.Priority, 0)
                    and isnull(recip_pocr.Active, 0) = isnull(donor_pocr.Active, 0)

                left join '+trim(@cDonorTablePath)+'WorkerCompType donor_wct on donor_eo.EPO_WorkerCompTypeID = donor_wct.ID
                left join '+trim(@cDonorTablePath)+'CountryStateType donor_wctcst on donor_wctcst.ID = donor_wct.CountryStateTypeID
                left join '+trim(@cRecipientTablePath)+'CountryStateType recip_wctcst on
                    recip_wctcst.CountryCode = donor_wctcst.CountryCode
                    and recip_wctcst.StateCode = donor_wctcst.StateCode
                left join '+trim(@cRecipientTablePath)+'WorkerCompType recip_wct on recip_wct.CompanyID = '+@cRecipientCompany_ID+'
                    and isnull(recip_wct.Code, '''') = isnull(donor_wct.Code, '''')
                    and isnull(recip_wct.Description, '''') = isnull(donor_wct.Description, '''')
                    and isnull(recip_wct.Priority, 0) = isnull(donor_wct.Priority, 0)
                    and isnull(recip_wct.Active, 0) = isnull(donor_wct.Active, 0)
                    and isnull(recip_wct.Rate, 0) = isnull(donor_wct.Rate, 0)
                    and isnull(recip_wct.ExperienceRating, 0) = isnull(donor_wct.ExperienceRating, 0)
                    and isnull(recip_wct.EvoFK_EDGroup, 0) = isnull(donor_wct.EvoFK_EDGroup, 0)
                    and isnull(recip_wct.OvertimeToReduce_EVO, '''') = isnull(donor_wct.OvertimeToReduce_EVO, '''')
                    and isnull(recip_wct.CountryStateTypeID, 0) = isnull(recip_wctcst.ID, 0)

                left join '+trim(@cDonorTablePath)+'PayGroupType donor_pgt on donor_eo.EPO_PayGroupTypeID = donor_pgt.ID
                left join '+trim(@cRecipientTablePath)+'PayGroupType recip_pgt on recip_pgt.CompanyID = '+@cRecipientCompany_ID+'
                    and isnull(recip_pgt.Code, '''') = isnull(donor_pgt.Code, '''')
                    and isnull(recip_pgt.Description, '''') = isnull(donor_pgt.Description, '''')
                    and isnull(recip_pgt.Priority, 0) = isnull(donor_pgt.Priority, 0)
                    and isnull(recip_pgt.Active, 0) = isnull(donor_pgt.Active, 0)
                    and isnull(recip_pgt.PR_Integration_PK, -1) = isnull(donor_pgt.PR_Integration_PK, -1)

                left join '+trim(@cDonorTablePath)+'EEOType donor_eeo on donor_eo.EPO_EEOTypeID = donor_eeo.ID
                left join '+trim(@cRecipientTablePath)+'EEOType recip_eeo on recip_eeo.CompanyID = '+@cRecipientCompany_ID+'
                    and isnull(recip_eeo.Code, '''') = isnull(donor_eeo.Code, '''')
                    and isnull(recip_eeo.Description, '''') = isnull(donor_eeo.Description, '''')
                    and isnull(recip_eeo.Priority, 0) = isnull(donor_eeo.Priority, 0)
                    and isnull(recip_eeo.Active, 0) = isnull(donor_eeo.Active, 0)

                left join '+trim(@cDonorTablePath)+'PayType donor_payt on donor_eo.COMP_PayTypeID = donor_payt.ID
                left join '+trim(@cRecipientTablePath)+'PayType recip_payt on recip_payt.CompanyID = '+@cRecipientCompany_ID+'
                    and isnull(recip_payt.Code, '''') = isnull(donor_payt.Code, '''')
                    and isnull(recip_payt.Description, '''') = isnull(donor_payt.Description, '''')
                    and isnull(recip_payt.Priority, 0) = isnull(donor_payt.Priority, 0)
                    and isnull(recip_payt.Active, 0) = isnull(donor_payt.Active, 0)

                left join '+trim(@cDonorTablePath)+'FrequencyType donor_ft on donor_eo.COMP_FrequencyTypeID = donor_ft.ID
                left join '+trim(@cRecipientTablePath)+'FrequencyType recip_ft on recip_ft.CompanyID = '+@cRecipientCompany_ID+'
                    and isnull(recip_ft.Code, '''') = isnull(donor_ft.Code, '''')
                    and isnull(recip_ft.Description, '''') = isnull(donor_ft.Description, '''')
                    and isnull(recip_ft.Priority, 0) = isnull(donor_ft.Priority, 0)
                    and isnull(recip_ft.Active, 0) = isnull(donor_ft.Active, 0)
                    and isnull(recip_ft.PaysPerYear, 0) = isnull(donor_ft.PaysPerYear, 0)

                left join '+trim(@cDonorTablePath)+'CompensationChangeReason donor_ccr on donor_eo.COMP_CompensationChangeReasonID = donor_ccr.ID
                left join '+trim(@cRecipientTablePath)+'CompensationChangeReason recip_ccr on recip_ccr.CompanyID = '+@cRecipientCompany_ID+'
                    and isnull(recip_ccr.Code, '''') = isnull(donor_ccr.Code, '''')
                    and isnull(recip_ccr.Description, '''') = isnull(donor_ccr.Description, '''')
                    and isnull(recip_ccr.Priority, 0) = isnull(donor_ccr.Priority, 0)
                    and isnull(recip_ccr.Active, 0) = isnull(donor_ccr.Active, 0)

                left join '+trim(@cDonorTablePath)+'BenefitClass donor_bc on donor_eo.BenefitClassID = donor_bc.ID
                left join '+trim(@cRecipientTablePath)+'BenefitClass recip_bc on recip_bc.CompanyID = '+@cRecipientCompany_ID+'
                    and isnull(recip_bc.Code, '''') = isnull(donor_bc.Code, '''')
                    and isnull(recip_bc.Description, '''') = isnull(donor_bc.Description, '''')
                    and isnull(recip_bc.Priority, 0) = isnull(donor_bc.Priority, 0)
                    and isnull(recip_bc.Active, 0) = isnull(donor_bc.Active, 0)

                left join '+trim(@cDonorTablePath)+'Employee donor_sup1 on donor_sup1.ID = donor_eo.EPO_Supervisor1ID
                left join '+trim(@cRecipientTablePath)+'Employee recip_sup1 on recip_sup1.EmployeeCode = donor_sup1.EmployeeCode and recip_sup1.CompanyID = '+@cRecipientCompany_ID+'

                left join '+trim(@cDonorTablePath)+'Employee donor_sup2 on donor_sup2.ID = donor_eo.EPO_Supervisor2ID
                left join '+trim(@cRecipientTablePath)+'Employee recip_sup2 on recip_sup2.EmployeeCode = donor_sup2.EmployeeCode and recip_sup2.CompanyID = '+@cRecipientCompany_ID+'

                left join '+trim(@cDonorTablePath)+'Employee donor_sup3 on donor_sup3.ID = donor_eo.EPO_Supervisor3ID
                left join '+trim(@cRecipientTablePath)+'Employee recip_sup3 on recip_sup3.EmployeeCode = donor_sup3.EmployeeCode and recip_sup3.CompanyID = '+@cRecipientCompany_ID+'

                left join '+trim(@cDonorTablePath)+'HRnextUser donor_user on donor_user.ID = donor_eo.USER_HRnextUserID
                left join '+trim(@cRecipientTablePath)+'HRnextUser recip_user on recip_user.username = donor_user.username
                
                left join '+trim(@cDonorTablePath)+'ATApplication donor_ata on donor_ata.ID = donor_eo.ATApplicationID
                left join '+trim(@cRecipientTablePath)+'ATApplication recip_ata
                    on recip_ata.ATApplicationKey = donor_ata.ATApplicationKey
                    and isnull(recip_ata.FirstName, '''') = isnull(donor_eo.FirstName, '''')
					and isnull(recip_ata.LastName, '''') = isnull(donor_eo.LastName, '''')
					and isnull(recip_ata.Address1, '''') = isnull(donor_ata.Address1, '''')
					and isnull(recip_ata.EmailAddress, '''') = isnull(donor_ata.EmailAddress, '''')

                left join '+trim(@cDonorTablePath)+'AutoPayType donor_apt on donor_apt.ID = donor_eo.COMP_AutoPayTypeID
                left join '+trim(@cRecipientTablePath)+'AutoPayType recip_apt
                    on isnull(recip_apt.Code, '''') = isnull(donor_apt.Code, '''')
                    and isnull(recip_apt.Description, '''') = isnull(donor_apt.Description, '''')
                    and isnull(recip_apt.Priority, 0) = isnull(donor_apt.Priority, 0)
                    and isnull(recip_apt.Active, 0) = isnull(donor_apt.Active, 0)

                left join '+trim(@cDonorTablePath)+'CountryStateType donor_bc_dl_cst on donor_bc_dl_cst.ID = donor_eo.BC_DLCountryStateTypeID
                left join '+trim(@cRecipientTablePath)+'CountryStateType recip_bc_dl_cst
                    on isnull(recip_bc_dl_cst.CountryCode, '''') = isnull(donor_bc_dl_cst.CountryCode, '''')
                    and isnull(recip_bc_dl_cst.CountryName, '''') = isnull(donor_bc_dl_cst.CountryName, '''')
                    and isnull(recip_bc_dl_cst.StateCode, '''') = isnull(donor_bc_dl_cst.StateCode, '''')
                    and isnull(recip_bc_dl_cst.StateName, '''') = isnull(donor_bc_dl_cst.StateName, '''')

                left join '+trim(@cDonorTablePath)+'CountryStateType donor_bc_cst on donor_bc_cst.ID = donor_eo.BC_CountryStateTypeID
                left join '+trim(@cRecipientTablePath)+'CountryStateType recip_bc_cst
                    on isnull(recip_bc_cst.CountryCode, '''') = isnull(donor_bc_cst.CountryCode, '''')
                    and isnull(recip_bc_cst.CountryName, '''') = isnull(donor_bc_cst.CountryName, '''')
                    and isnull(recip_bc_cst.StateCode, '''') = isnull(donor_bc_cst.StateCode, '''')
                    and isnull(recip_bc_cst.StateName, '''') = isnull(donor_bc_cst.StateName, '''')

                left join '+trim(@cDonorTablePath)+'CountryStateType donor_cst on donor_cst.ID = donor_eo.CountryStateTypeID
                left join '+trim(@cRecipientTablePath)+'CountryStateType recip_cst
                    on isnull(recip_cst.CountryCode, '''') = isnull(donor_cst.CountryCode, '''')
                    and isnull(recip_cst.CountryName, '''') = isnull(donor_cst.CountryName, '''')
                    and isnull(recip_cst.StateCode, '''') = isnull(donor_cst.StateCode, '''')
                    and isnull(recip_cst.StateName, '''') = isnull(donor_cst.StateName, '''')

                left join '+trim(@cDonorTablePath)+'CountryStateType donor_ec_cst on donor_ec_cst.ID = donor_eo.EC_CountryStateTypeID
                left join '+trim(@cRecipientTablePath)+'CountryStateType recip_ec_cst
                    on isnull(recip_ec_cst.CountryCode, '''') = isnull(donor_ec_cst.CountryCode, '''')
                    and isnull(recip_ec_cst.CountryName, '''') = isnull(donor_ec_cst.CountryName, '''')
                    and isnull(recip_ec_cst.StateCode, '''') = isnull(donor_ec_cst.StateCode, '''')
                    and isnull(recip_ec_cst.StateName, '''') = isnull(donor_ec_cst.StateName, '''')

                left join '+trim(@cDonorTablePath)+'EducationLevelType donor_elt on donor_elt.ID = donor_eo.EducationLevelTypeID
                left join '+trim(@cRecipientTablePath)+'EducationLevelType recip_elt
                    on isnull(recip_elt.Code, '''') = isnull(donor_elt.Code, '''')
                    and isnull(recip_elt.Description, '''') = isnull(donor_elt.Description, '''')
                    and isnull(recip_elt.Priority, 0) = isnull(donor_elt.Priority, 0)
                    and isnull(recip_elt.Active, 0) = isnull(donor_elt.Active, 0)
                
                left join '+trim(@cDonorTablePath)+'EthnicityType donor_etht on donor_eo.EthnicityTypeID = donor_etht.ID
                left join '+trim(@cRecipientTablePath)+'EthnicityType recip_etht on recip_etht.CompanyID = '+@cRecipientCompany_ID+'
                    and isnull(recip_etht.Code, '''') = isnull(donor_etht.Code, '''')
                    and isnull(recip_etht.Description, '''') = isnull(donor_etht.Description, '''')
                    and isnull(recip_etht.Priority, 0) = isnull(donor_etht.Priority, 0)
                    and isnull(recip_etht.Active, 0) = isnull(donor_etht.Active, 0)

                left join '+trim(@cDonorTablePath)+'GenderType donor_gt on donor_gt.ID = donor_eo.GenderTypeID
                left join '+trim(@cRecipientTablePath)+'GenderType recip_gt
                    on isnull(recip_gt.Code, '''') = isnull(donor_gt.Code, '''')
                    and isnull(recip_gt.Description, '''') = isnull(donor_gt.Description, '''')
                    and isnull(recip_gt.Priority, 0) = isnull(donor_gt.Priority, 0)
                    and isnull(recip_gt.Active, 0) = isnull(donor_gt.Active, 0)

                left join '+trim(@cDonorTablePath)+'MaritalStatusType donor_mst on donor_mst.ID = donor_eo.MaritalStatusTypeID
                left join '+trim(@cRecipientTablePath)+'MaritalStatusType recip_mst
                    on isnull(recip_mst.Code, '''') = isnull(donor_mst.Code, '''')
                    and isnull(recip_mst.Description, '''') = isnull(donor_mst.Description, '''')
                    and isnull(recip_mst.Priority, 0) = isnull(donor_mst.Priority, 0)
                    and isnull(recip_mst.Active, 0) = isnull(donor_mst.Active, 0)

                left join '+trim(@cDonorTablePath)+'TaxFormType donor_tft on donor_tft.ID = donor_eo.TaxFormTypeID
                left join '+trim(@cRecipientTablePath)+'TaxFormType recip_tft
                    on isnull(recip_tft.Code, '''') = isnull(donor_tft.Code, '''')
                    and isnull(recip_tft.Description, '''') = isnull(donor_tft.Description, '''')
                    and isnull(recip_tft.Priority, 0) = isnull(donor_tft.Priority, 0)
                    and isnull(recip_tft.Active, 0) = isnull(donor_tft.Active, 0)

                left join '+trim(@cDonorTablePath)+'CountryStateType donor_w4_cst on donor_w4_cst.ID = donor_eo.W4_CountryStateTypeID
                left join '+trim(@cRecipientTablePath)+'CountryStateType recip_w4_cst
                    on isnull(recip_w4_cst.CountryCode, '''') = isnull(donor_w4_cst.CountryCode, '''')
                    and isnull(recip_w4_cst.CountryName, '''') = isnull(donor_w4_cst.CountryName, '''')
                    and isnull(recip_w4_cst.StateCode, '''') = isnull(donor_w4_cst.StateCode, '''')
                    and isnull(recip_w4_cst.StateName, '''') = isnull(donor_w4_cst.StateName, '''')

                left join '+trim(@cDonorTablePath)+'CountryStateType donor_hs_cst on donor_hs_cst.ID = donor_eo.HomeStateID_EVO
                left join '+trim(@cRecipientTablePath)+'CountryStateType recip_hs_cst
                    on isnull(recip_hs_cst.CountryCode, '''') = isnull(donor_hs_cst.CountryCode, '''')
                    and isnull(recip_hs_cst.CountryName, '''') = isnull(donor_hs_cst.CountryName, '''')
                    and isnull(recip_hs_cst.StateCode, '''') = isnull(donor_hs_cst.StateCode, '''')
                    and isnull(recip_hs_cst.StateName, '''') = isnull(donor_hs_cst.StateName, '''')

                left join '+trim(@cDonorTablePath)+'FrequencyType donor_ft_evo on donor_eo.FrequencyTypeID_EVO = donor_ft_evo.ID
                left join '+trim(@cRecipientTablePath)+'FrequencyType recip_ft_evo on recip_ft_evo.CompanyID = '+@cRecipientCompany_ID+'
                    and isnull(recip_ft_evo.Code, '''') = isnull(donor_ft_evo.Code, '''')
                    and isnull(recip_ft_evo.Description, '''') = isnull(donor_ft_evo.Description, '''')
                    and isnull(recip_ft_evo.Priority, 0) = isnull(donor_ft_evo.Priority, 0)
                    and isnull(recip_ft_evo.Active, 0) = isnull(donor_ft_evo.Active, 0)
                    and isnull(recip_ft_evo.PaysPerYear, 0) = isnull(donor_ft_evo.PaysPerYear, 0)

                left join '+trim(@cDonorTablePath)+'OnboardingStatusType donor_ost on donor_ost.ID = donor_eo.OnboardingStatusTypeID
                left join '+trim(@cRecipientTablePath)+'OnboardingStatusType recip_ost
                    on isnull(recip_ost.Code, '''') = isnull(donor_ost.Code, '''')
                    and isnull(recip_ost.Description, '''') = isnull(donor_ost.Description, '''')
                    and isnull(recip_ost.Priority, 0) = isnull(donor_ost.Priority, 0)
                    and isnull(recip_ost.Active, 0) = isnull(donor_ost.Active, 0)

               where donor_eo.CompanyID ='+ @cDonorCompany_ID

            exec (@cmdInsert)
            if @cShowStatement = 1
            begin
                select @cmdInsert
            end
            if @cVerbose_Ind = 1
            begin
                select 'EmployeeOnboard - A' as Insertdata
            end
        end
    end

-- This Query verifies and loads the data from Donor

	if @cValidateType_Cd = 'InsertFullValidate'
	
	begin

		select  @cFailCodes = 'InsertFullValidate Not Available At This Time'
				
	end

	-- This Query deletes the data from Receiver system
	if @cValidateType_Cd = 'Delete'
	
	begin

		--This is the Recipient table
		--select @cmdShowDataDonor = 'delete from '+trim(@cRecipientTablePath)+trim(@cTableName)+' where CompanyID = '+@cRecipientCompany_ID
		--exec (@cmdShowDataDonor)
		select  @cFailCodes = 'Delete Not Available At This Time'
	
	end
	
	select @cFailCodes as 'Return Code'

ExitPgm:
return 0
GO

/*	Now check to make sure it has been created (dbo.usp_EIN_Cons_EmployeeOnboard_V1 ) */ 
	if object_id('dbo.usp_EIN_Cons_EmployeeOnboard_V1') is not null
		print 'Proc dbo.usp_EIN_Cons_EmployeeOnboard_V1 has been CREATED Successfully. '
	else
		print 'Create Proc dbo.usp_EIN_Cons_EmployeeOnboard_V1 FAILED'
GO

/*	now Grant Permissions on dbo.usp_EIN_Cons_EmployeeOnboard_V1 to public */
	grant execute on dbo.usp_EIN_Cons_EmployeeOnboard_V1 to public
	print 'Execute rights have been GRANTED to group public on usp_EIN_Cons_EmployeeOnboard_V1'
GO
  
/*-----------------------------------------------------------------
	eof -  usp_EIN_Cons_EmployeeOnboard_V1.sql 
-----------------------------------------------------------------*/

