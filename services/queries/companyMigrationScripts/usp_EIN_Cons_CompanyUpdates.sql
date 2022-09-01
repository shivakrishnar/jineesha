/*-----------------------------------------------------------------
 usp_EIN_Cons_CompanyUpdates
-----------------------------------------------------------------*/
/*
	Syntax	: exec  usp_EIN_Cons_CompanyUpdates
		Ex.	: 	
			execute usp_EIN_Cons_CompanyUpdates '[adhr-1].[dbo].', '[adhr-2].[dbo].', 1, 1, '600373', '600351', 'ShowData','e'
			execute usp_EIN_Cons_CompanyUpdates '[adhr-1].[dbo].', '[adhr-2].[dbo].', 1, 0, '600373', '600351', 'Insert','ZZZ'
			execute usp_EIN_Cons_CompanyUpdates '[adhr-1].[dbo].', '[adhr-2].[dbo].', 1, 0, '600373', '600351', 'InsertFullValidate','ZZZ'
			execute usp_EIN_Cons_CompanyUpdates '[adhr-1].[dbo].', '[adhr-2].[dbo].', 1, 0, '600373', '600351', 'Delete','ZZZ'
		
	Purpose	:

	Params	: none. 
	Calls	: none.
	Returns	: none.
	Special	: none.
	Notes	: none.
	Author	: Cuong Lai	Date : 02/24/22
	Notice	: Copyright (c) 2022 Asure Inc., All Rights Reserved.

	Last Mod	:
*/
/*-----------------------------------------------------------------*/
/*	First Drop Proc dbo.usp_EIN_Cons_CompanyUpdates */
	if object_id('dbo.usp_EIN_Cons_CompanyUpdates') is not null
	begin
		drop procedure dbo.usp_EIN_Cons_CompanyUpdates
		print 'Dropped Proc dbo.usp_EIN_Cons_CompanyUpdates '
	end
GO

	create procedure usp_EIN_Cons_CompanyUpdates
	
		@cDonorDatabasePath		char(75),
		@cRecipientDatabasePath	char(75),
		@cVerbose_Ind			bit,
		@cShowStatement			bit,
		@cRecipientCompany_ID	char(8),
		@cDonorCompany_ID		char(8),
		@cValidateType_Cd		char(20),
		@cTableToRun			char(50)

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
	declare @cRecipientTablePath char(75)
	declare @cDonorCompanyID char(8)
	declare @cRecipientCompanyID char(8)

	--declare @DonorT1EmpCd bigint
	--declare @DonorT1ID bigint
	--declare @RecipientT1EmpCd bigint
	--declare @RecipientT1ID bigint

	select @cDonorTablePath = trim(@cDonorDatabasePath) --'[adhr-1].[dbo].'
	select @cRecipientTablePath = trim(@cRecipientDatabasePath) --'[adhr-2].[dbo].'

	--select @cDonorCountPath = trim(@cDonorTablePath)+trim(@cTableName)
	--select @cRecipientCountPath = trim(@cRecipientTablePath)+trim(@cTableName)
--	select @cDonorCountPath

	set nocount on
	
	-- Check for existence of both CompanyID
--	set @cmdCountDataDonor = 'select @cDonorExistCount = case when count(*) > 0 then 1 else 0 end from @cDonorCountPath where CompanyID = @cDonorCompany_ID'
	--set @cmdCountDataDonor	 = 'select @cDonorExistCount = case when count(*) > 0 then 1 else 0 end from [adhr-1].[dbo].ATApplicationVersion where CompanyID = @cDonorCompany_ID'
--	execute sp_executesql @cmdCountDataDonor, N'@cDonorCountPath nvarchar(100), @cDonorCompany_ID char(8), @cDonorExistCount tinyint OUTPUT', @cDonorCountPath = @cDonorCountPath, @cDonorCompany_ID = @cDonorCompany_ID, @cDonorExistCount = @cDonorExistCount OUTPUT
	--execute sp_executesql @cmdCountDataDonor, N'@cDonorCompany_ID char(8), @cDonorExistCount tinyint OUTPUT', @cDonorCompany_ID, @cDonorExistCount OUTPUT
--	select @nDonorExistCount as Counts
	--select @cmdCountDataDonor	 = 'select @cDonorExistCount = case when count(*) > 0 then 1 else 0 end from '+trim(@DonorTablePath)+trim(@TableName)+' where CompanyID = '+@cDonorCompany_ID
	--select @cmdCountDataRecipient = 'select @cRecipientExistCount = case when count(*) > 0 then 1 else 0 end from '+trim(@RecipientTablePath)+trim(@TableName)+' where CompanyID = '+@cRecipientCompany_ID

	--select @nDonorExistCount = case when count(*) > 0 then @cDonorExistCount + 1 else @cDonorExistCount end from [adhr-1].[dbo].[ATApplicationVersion] where CompanyID = @cDonorCompany_ID
	--select @nRecipientExistCount = case when count(*) > 0 then @cRecipientExistCount + 1 else @cRecipientExistCount end from [adhr-1].[dbo].[ATApplicationVersion] where CompanyID = @cRecipientCompany_ID

	-- ------------------------------------------------------------
	-- This Query just returns the data from Donor system without verifiyng or moving anything
	if @cValidateType_Cd = 'ShowData'
	begin
		if @cTableToRun = 'ZZZ' or @cTableToRun like '%A%'
		begin
			select @cmdShowDataRecipient = '
			select
				recip_tft.ID as NHDefaultTaxFormTypeID,
				donor_c.NHDefaultIsEmergencyContactDisplayed,
				donor_c.NHDefaultIsEmergencyContactRequired,
				donor_c.IsEVerifyParticipant,
				donor_c.IsDirectDepositMandatory,
				recip_ft.ID as NHDefaultFrequencyTypeID,
				recip_pt.ID as NHDefaultPayTypeID,
				recip_ccr.ID as NHDefaultCompensationChangeReasonID,
				recip_et.ID as NHDefaultEmploymentTypeID,
				recip_st.ID as NHDefaultStatusTypeID,
				recip_pocr.ID as NHDefaultPositionOrganizationChangeReasonID,
				recip_termst.ID as TERMDefaultStatusTypeID,
				recip_tr.ID as TERMDefaultTerminationReasonID,
				recip_sr.ID as ATDefaultApplicantRoleID,
				donor_c.IsPrivateLabelAllowed,
				donor_c.IsLandingSectionOnAnnouncements,
				donor_c.IsLandingSectionOnCertificateExp,
				donor_c.IsLandingSectionOnScheduledReviews,
				donor_c.IsLandingSectionOnAnniversaries,
				donor_c.IsLandingSectionOnBirthdays,
				donor_c.IsLandingSectionOnLicenseExp,
				donor_c.IsLandingSectionOnTimeOffRequests,
				donor_c.IsLandingSectionOnEmployeeW4,
				donor_c.IsLandingSectionOnUpcomingTimeoff,
				donor_c.IsLandingSectionOnMyUpcomingReviewsShowAcknowledgementIcon,
				donor_c.IsLandingSectionOnMyUpcomingClassesShowAcknowledgementIcon,
				donor_c.IsLandingSectionOnExpiringCertificationsShowAcknowledgementIcon,
				donor_c.IsLandingSectionOnExpiringLicensesShowAcknowledgementIcon,
				donor_c.IsLandingSectionOnMyUpcomingReviews,
				donor_c.IsLandingSectionOnMyUpcomingClasses,
				donor_c.IsLandingSectionOnExpiringCertifications,
				donor_c.IsLandingSectionOnExpiringLicenses,
				donor_c.IsLandingSectionOnPayrollSummaryQuickLink,
				donor_c.LandingSectionHistoryInMonths,
				recip_ept.ID as EsignatureProductTierID
			from
				'+trim(@cRecipientTablePath)+'Company recip_c
			join '+trim(@cDonorTablePath)+'Company donor_c on donor_c.ID = '+@cDonorCompany_ID+'

			left join '+trim(@cDonorTablePath)+'TaxFormType donor_tft on donor_tft.ID = donor_c.NHDefaultTaxFormTypeID
			left join '+trim(@cRecipientTablePath)+'TaxFormType recip_tft on recip_tft.Code = donor_tft.Code and recip_tft.Description = donor_tft.Description

			left join '+trim(@cDonorTablePath)+'FrequencyType donor_ft on donor_ft.ID = donor_c.NHDefaultFrequencyTypeID and donor_ft.CompanyID = donor_c.ID
			left join '+trim(@cRecipientTablePath)+'FrequencyType recip_ft on recip_ft.Code = donor_ft.Code and recip_ft.Description = donor_ft.Description and recip_ft.CompanyID = recip_c.ID

			left join '+trim(@cDonorTablePath)+'PayType donor_pt on donor_pt.ID = donor_c.NHDefaultPayTypeID and donor_pt.CompanyID = donor_c.ID
			left join '+trim(@cRecipientTablePath)+'PayType recip_pt on recip_pt.Code = donor_pt.Code and recip_pt.Description = donor_pt.Description and recip_pt.CompanyID = recip_c.ID

			left join '+trim(@cDonorTablePath)+'CompensationChangeReason donor_ccr on donor_ccr.ID = donor_c.NHDefaultCompensationChangeReasonID and donor_ccr.CompanyID = donor_c.ID
			left join '+trim(@cRecipientTablePath)+'CompensationChangeReason recip_ccr on recip_ccr.Code = donor_ccr.Code and recip_ccr.Description = donor_ccr.Description and recip_ccr.CompanyID = recip_c.ID

			left join '+trim(@cDonorTablePath)+'EmploymentType donor_et on donor_et.ID = donor_c.NHDefaultEmploymentTypeID and donor_et.CompanyID = donor_c.ID
			left join '+trim(@cRecipientTablePath)+'EmploymentType recip_et on recip_et.Code = donor_et.Code and recip_et.Description = donor_et.Description and recip_et.CompanyID = recip_c.ID

			left join '+trim(@cDonorTablePath)+'StatusType donor_st on donor_st.ID = donor_c.NHDefaultStatusTypeID and donor_st.CompanyID = donor_c.ID
			left join '+trim(@cRecipientTablePath)+'StatusType recip_st on recip_st.Code = donor_st.Code and recip_st.Description = donor_st.Description and recip_st.CompanyID = recip_c.ID

			left join '+trim(@cDonorTablePath)+'PositionOrganizationChangeReason donor_pocr on donor_pocr.ID = donor_c.NHDefaultPositionOrganizationChangeReasonID and donor_pocr.CompanyID = donor_c.ID
			left join '+trim(@cRecipientTablePath)+'PositionOrganizationChangeReason recip_pocr on recip_pocr.Code = donor_pocr.Code and recip_pocr.Description = donor_pocr.Description and recip_pocr.CompanyID = recip_c.ID

			left join '+trim(@cDonorTablePath)+'StatusType donor_termst on donor_termst.ID = donor_c.TERMDefaultStatusTypeID and donor_termst.CompanyID = donor_c.ID
			left join '+trim(@cRecipientTablePath)+'StatusType recip_termst on recip_termst.Code = donor_termst.Code and recip_termst.Description = donor_termst.Description and recip_termst.CompanyID = recip_c.ID

			left join '+trim(@cDonorTablePath)+'TerminationReason donor_tr on donor_tr.ID = donor_c.TERMDefaultTerminationReasonID and donor_tr.CompanyID = donor_c.ID
			left join '+trim(@cRecipientTablePath)+'TerminationReason recip_tr on recip_tr.Code = donor_tr.Code and recip_tr.Description = donor_tr.Description and recip_tr.CompanyID = recip_c.ID

			left join '+trim(@cDonorTablePath)+'SecRole donor_sr on donor_sr.ID = donor_c.ATDefaultApplicantRoleID and donor_sr.CompanyID = donor_c.ID
			left join '+trim(@cRecipientTablePath)+'SecRole recip_sr on recip_sr.Description = donor_sr.Description and recip_sr.CompanyID = recip_c.ID

			left join '+trim(@cDonorTablePath)+'EsignatureProductTier donor_ept on donor_ept.ID = donor_c.EsignatureProductTierID
			left join '+trim(@cRecipientTablePath)+'EsignatureProductTier recip_ept on recip_ept.Name = donor_ept.Name and recip_ept.Description = donor_ept.Description

			where donor_c.ID = '+@cDonorCompany_ID+' and recip_c.ID = '+@cRecipientCompany_ID

			exec (@cmdShowDataRecipient)
			if @cShowStatement = 1
			begin
				select @cmdShowDataRecipient
			end
			if @cVerbose_Ind = 1
			begin
				select 'Company List Updates - A' as Showdata
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%B%'
		begin
			select @cmdShowDataRecipient = '
			select
				recip_c.ID as CompanyID,
				donor_pt.Code,
				donor_pt.Title,
				donor_pt.Priority,
				donor_pt.Active,
				donor_pt.ApprovedDate,
				donor_pt.EffectiveDate,
				donor_pt.ClosedDate,
				donor_pt.IsBudgeted,
				recip_pgt.ID as PayGradeTypeID,
				recip_et.ID as EEOTypeID,
				recip_wct.ID as WorkerCompTypeID,
				recip_ee.ID as SupervisorID,
				donor_pt.FTE,
				donor_pt.Description,
				donor_pt.Requirements,
				donor_pt.IsOTExempt,
				recip_ft.ID as FLSATypeID,
				donor_pt.PR_Integration_PK
			from
				'+trim(@cDonorTablePath)+'PositionType donor_pt
			join '+trim(@cRecipientTablePath)+'Company recip_c on recip_c.ID = '+@cRecipientCompany_ID+'

			left join '+trim(@cDonorTablePath)+'PayGradeType donor_pgt on donor_pgt.ID = donor_pt.PayGradeTypeID
			left join '+trim(@cRecipientTablePath)+'PayGradeType recip_pgt on recip_pgt.Code = donor_pgt.Code and recip_pgt.Description = donor_pgt.Description and recip_pgt.CompanyID = recip_c.ID

			left join '+trim(@cDonorTablePath)+'EEOType donor_et on donor_et.ID = donor_pt.EEOTypeID
			left join '+trim(@cRecipientTablePath)+'EEOType recip_et on recip_et.Code = donor_et.Code and recip_et.Description = donor_et.Description and recip_et.CompanyID = recip_c.ID

			left join '+trim(@cDonorTablePath)+'WorkerCompType donor_wct on donor_wct.ID = donor_pt.WorkerCompTypeID
			left join '+trim(@cRecipientTablePath)+'WorkerCompType recip_wct on recip_wct.Code = donor_wct.Code and recip_wct.Description = donor_wct.Description and recip_wct.CompanyID = recip_c.ID

			left join '+trim(@cDonorTablePath)+'Employee donor_ee on donor_ee.ID = donor_pt.SupervisorID
			left join '+trim(@cRecipientTablePath)+'Employee recip_ee on recip_ee.EmployeeCode = donor_ee.EmployeeCode and recip_ee.CompanyID = recip_c.ID

			left join '+trim(@cDonorTablePath)+'FLSAType donor_ft on donor_ft.ID = donor_pt.FLSATypeID
			left join '+trim(@cRecipientTablePath)+'FLSAType recip_ft on recip_ft.Code = donor_ft.Code and recip_ft.Description = donor_ft.Description

			where donor_pt.CompanyID = '+@cDonorCompany_ID

			exec (@cmdShowDataRecipient)
			if @cShowStatement = 1
			begin
				select @cmdShowDataRecipient
			end
			if @cVerbose_Ind = 1
			begin
				select 'PositionType - B' as Showdata
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%C%'
		begin
			select @cmdShowDataRecipient = '
				declare
					@recipAlertId int,
					@donorEmployeeIds nvarchar(max),
					@donorUserIds nvarchar(max),
					@recipientEmployeeIds nvarchar(max),
					@recipientUserIds nvarchar(max);

				declare alert_recipients_cursor cursor for
				select
					recip_a.ID,
					donor_a.RecipientKeysEmployee,
					donor_a.RecipientKeysUser
				from
					'+trim(@cRecipientTablePath)+'Alert recip_a
				join '+trim(@cDonorTablePath)+'Alert donor_a on donor_a.TemplateSubject = recip_a.TemplateSubject and donor_a.TemplateBody = recip_a.TemplateBody
				where
					recip_a.CompanyID = '+@cRecipientCompany_ID+' and
					donor_a.CompanyID = '+@cDonorCompany_ID+' and
					(donor_a.RecipientKeysEmployee is not null or donor_a.RecipientKeysUser is not null);

				open alert_recipients_cursor;
				fetch next from alert_recipients_cursor into @recipAlertId, @donorEmployeeIds, @donorUserIds;'
			select @cmdShowDataRecipient = @cmdShowDataRecipient + '
				while @@fetch_status = 0
				begin
					set @recipientEmployeeIds = null
					set @recipientUserIds = null

					;with EmployeeIDs as (
						select recip_ee.ID as eeId from string_split(@donorEmployeeIds, '','') donor_ae
						join '+trim(@cDonorTablePath)+'Employee donor_ee on donor_ee.ID = donor_ae.[value]
						join '+trim(@cRecipientTablePath)+'Employee recip_ee on recip_ee.EmployeeCode = donor_ee.EmployeeCode
						where recip_ee.CompanyID = '+@cRecipientCompany_ID+'
					)
					select @recipientEmployeeIds = coalesce(@recipientEmployeeIds + '','', '''') + cast(eeId as nvarchar) from EmployeeIDs

					;with UserIDs as (
						select recip_u.ID as userId from string_split(@donorUserIds, '','') donor_au
						join '+trim(@cDonorTablePath)+'HRnextUser donor_u on donor_u.ID = donor_au.[value]
						join '+trim(@cRecipientTablePath)+'HRnextUser recip_u on recip_u.Username = donor_u.Username
					)
					select @recipientUserIds = coalesce(@recipientUserIds + '','', '''') + cast(userId as nvarchar) from UserIDs

					select @recipAlertId as alertId, @recipientEmployeeIds as recipEmployeeKeys, @recipientUserIds as recipUserKeys,
						@donorEmployeeIds as donorEmployeeKeys, @donorUserIds as donorUserKeys

					fetch next from alert_recipients_cursor into @recipAlertId, @donorEmployeeIds, @donorUserIds;
				end

				close alert_recipients_cursor;
				deallocate alert_recipients_cursor;'

			exec (@cmdShowDataRecipient)
			if @cShowStatement = 1
			begin
				select @cmdShowDataRecipient
			end
			if @cVerbose_Ind = 1
			begin
				select 'Alert Recipient Update - C' as Showdata
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%D%'
		begin
			----------------QRWSavedReport
			select @cmdShowDataDonor = 'select T1.Name, T1.Description, T1.QRWConceptID, R2.ID, T1.SelectedFields, case when T1.CompanyID is null then null else '+@cRecipientCompany_ID+' end, T1.ActiveEmployee, T1.OrderBy, T1.SimpleWhere, T1.ComplexWhere, T1.IsPublic
			from '+@cDonorTablePath+'QRWSavedReport T1
			join '+@cDonorTablePath+'HRNextUser D2 on D2.ID = T1.HRNextUserID
			join '+@cDonorTablePath+'HRNextUserCompany D3 on D3.HRnextUserID = D2.ID
			join '+trim(@cRecipientTablePath)+'HRNextUser R2 on R2.Username = D2.Username
			where D3.CompanyID ='+ @cDonorCompany_ID +'or T1.CompanyID ='+ @cDonorCompany_ID

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'QRWSavedReport - D' as ShowData
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
			select @cmdInsert = '
			update recip_c set
			    recip_c.NHDefaultTaxFormTypeID = recip_tft.ID,
			    recip_c.NHDefaultIsEmergencyContactDisplayed = donor_c.NHDefaultIsEmergencyContactDisplayed,
			    recip_c.NHDefaultIsEmergencyContactRequired = donor_c.NHDefaultIsEmergencyContactRequired,
			    recip_c.IsEVerifyParticipant = donor_c.IsEVerifyParticipant,
			    recip_c.IsDirectDepositMandatory = donor_c.IsDirectDepositMandatory,
			    recip_c.NHDefaultFrequencyTypeID = recip_ft.ID,
			    recip_c.NHDefaultPayTypeID = recip_pt.ID,
			    recip_c.NHDefaultCompensationChangeReasonID = recip_ccr.ID,
			    recip_c.NHDefaultEmploymentTypeID = recip_et.ID,
			    recip_c.NHDefaultStatusTypeID = recip_st.ID,
			    recip_c.NHDefaultPositionOrganizationChangeReasonID = recip_pocr.ID,
			    recip_c.TERMDefaultStatusTypeID = recip_termst.ID,
			    recip_c.TERMDefaultTerminationReasonID = recip_tr.ID,
			    recip_c.ATDefaultApplicantRoleID = recip_sr.ID,
			    recip_c.IsPrivateLabelAllowed = donor_c.IsPrivateLabelAllowed,
                recip_c.IsLandingSectionOnAnnouncements = donor_c.IsLandingSectionOnAnnouncements,
                recip_c.IsLandingSectionOnCertificateExp = donor_c.IsLandingSectionOnCertificateExp,
                recip_c.IsLandingSectionOnScheduledReviews = donor_c.IsLandingSectionOnScheduledReviews,
                recip_c.IsLandingSectionOnAnniversaries = donor_c.IsLandingSectionOnAnniversaries,
                recip_c.IsLandingSectionOnBirthdays = donor_c.IsLandingSectionOnBirthdays,
                recip_c.IsLandingSectionOnLicenseExp = donor_c.IsLandingSectionOnLicenseExp,
                recip_c.IsLandingSectionOnTimeOffRequests = donor_c.IsLandingSectionOnTimeOffRequests,
                recip_c.IsLandingSectionOnEmployeeW4 = donor_c.IsLandingSectionOnEmployeeW4,
                recip_c.IsLandingSectionOnUpcomingTimeoff = donor_c.IsLandingSectionOnUpcomingTimeoff,
                recip_c.IsLandingSectionOnMyUpcomingReviewsShowAcknowledgementIcon = donor_c.IsLandingSectionOnMyUpcomingReviewsShowAcknowledgementIcon,
                recip_c.IsLandingSectionOnMyUpcomingClassesShowAcknowledgementIcon = donor_c.IsLandingSectionOnMyUpcomingClassesShowAcknowledgementIcon,
                recip_c.IsLandingSectionOnExpiringCertificationsShowAcknowledgementIcon = donor_c.IsLandingSectionOnExpiringCertificationsShowAcknowledgementIcon,
                recip_c.IsLandingSectionOnExpiringLicensesShowAcknowledgementIcon = donor_c.IsLandingSectionOnExpiringLicensesShowAcknowledgementIcon,
                recip_c.IsLandingSectionOnMyUpcomingReviews = donor_c.IsLandingSectionOnMyUpcomingReviews,
                recip_c.IsLandingSectionOnMyUpcomingClasses = donor_c.IsLandingSectionOnMyUpcomingClasses,
                recip_c.IsLandingSectionOnExpiringCertifications = donor_c.IsLandingSectionOnExpiringCertifications,
                recip_c.IsLandingSectionOnExpiringLicenses = donor_c.IsLandingSectionOnExpiringLicenses,
                recip_c.IsLandingSectionOnPayrollSummaryQuickLink = donor_c.IsLandingSectionOnPayrollSummaryQuickLink,
                recip_c.LandingSectionHistoryInMonths = donor_c.LandingSectionHistoryInMonths,
			    recip_c.EsignatureProductTierID = recip_ept.ID
			from
				'+trim(@cRecipientTablePath)+'Company recip_c
			join '+trim(@cDonorTablePath)+'Company donor_c on donor_c.ID = '+@cDonorCompany_ID+'

			left join '+trim(@cDonorTablePath)+'TaxFormType donor_tft on donor_tft.ID = donor_c.NHDefaultTaxFormTypeID
			left join '+trim(@cRecipientTablePath)+'TaxFormType recip_tft on recip_tft.Code = donor_tft.Code and recip_tft.Description = donor_tft.Description

			left join '+trim(@cDonorTablePath)+'FrequencyType donor_ft on donor_ft.ID = donor_c.NHDefaultFrequencyTypeID and donor_ft.CompanyID = donor_c.ID
			left join '+trim(@cRecipientTablePath)+'FrequencyType recip_ft on recip_ft.Code = donor_ft.Code and recip_ft.Description = donor_ft.Description and recip_ft.CompanyID = recip_c.ID

			left join '+trim(@cDonorTablePath)+'PayType donor_pt on donor_pt.ID = donor_c.NHDefaultPayTypeID and donor_pt.CompanyID = donor_c.ID
			left join '+trim(@cRecipientTablePath)+'PayType recip_pt on recip_pt.Code = donor_pt.Code and recip_pt.Description = donor_pt.Description and recip_pt.CompanyID = recip_c.ID

			left join '+trim(@cDonorTablePath)+'CompensationChangeReason donor_ccr on donor_ccr.ID = donor_c.NHDefaultCompensationChangeReasonID and donor_ccr.CompanyID = donor_c.ID
			left join '+trim(@cRecipientTablePath)+'CompensationChangeReason recip_ccr on recip_ccr.Code = donor_ccr.Code and recip_ccr.Description = donor_ccr.Description and recip_ccr.CompanyID = recip_c.ID

			left join '+trim(@cDonorTablePath)+'EmploymentType donor_et on donor_et.ID = donor_c.NHDefaultEmploymentTypeID and donor_et.CompanyID = donor_c.ID
			left join '+trim(@cRecipientTablePath)+'EmploymentType recip_et on recip_et.Code = donor_et.Code and recip_et.Description = donor_et.Description and recip_et.CompanyID = recip_c.ID

			left join '+trim(@cDonorTablePath)+'StatusType donor_st on donor_st.ID = donor_c.NHDefaultStatusTypeID and donor_st.CompanyID = donor_c.ID
			left join '+trim(@cRecipientTablePath)+'StatusType recip_st on recip_st.Code = donor_st.Code and recip_st.Description = donor_st.Description and recip_st.CompanyID = recip_c.ID

			left join '+trim(@cDonorTablePath)+'PositionOrganizationChangeReason donor_pocr on donor_pocr.ID = donor_c.NHDefaultPositionOrganizationChangeReasonID and donor_pocr.CompanyID = donor_c.ID
			left join '+trim(@cRecipientTablePath)+'PositionOrganizationChangeReason recip_pocr on recip_pocr.Code = donor_pocr.Code and recip_pocr.Description = donor_pocr.Description and recip_pocr.CompanyID = recip_c.ID

			left join '+trim(@cDonorTablePath)+'StatusType donor_termst on donor_termst.ID = donor_c.TERMDefaultStatusTypeID and donor_termst.CompanyID = donor_c.ID
			left join '+trim(@cRecipientTablePath)+'StatusType recip_termst on recip_termst.Code = donor_termst.Code and recip_termst.Description = donor_termst.Description and recip_termst.CompanyID = recip_c.ID

			left join '+trim(@cDonorTablePath)+'TerminationReason donor_tr on donor_tr.ID = donor_c.TERMDefaultTerminationReasonID and donor_tr.CompanyID = donor_c.ID
			left join '+trim(@cRecipientTablePath)+'TerminationReason recip_tr on recip_tr.Code = donor_tr.Code and recip_tr.Description = donor_tr.Description and recip_tr.CompanyID = recip_c.ID

			left join '+trim(@cDonorTablePath)+'SecRole donor_sr on donor_sr.ID = donor_c.ATDefaultApplicantRoleID and donor_sr.CompanyID = donor_c.ID
			left join '+trim(@cRecipientTablePath)+'SecRole recip_sr on recip_sr.Description = donor_sr.Description and recip_sr.CompanyID = recip_c.ID

			left join '+trim(@cDonorTablePath)+'EsignatureProductTier donor_ept on donor_ept.ID = donor_c.EsignatureProductTierID
			left join '+trim(@cRecipientTablePath)+'EsignatureProductTier recip_ept on recip_ept.Name = donor_ept.Name and recip_ept.Description = donor_ept.Description

			where donor_c.ID = '+@cDonorCompany_ID+' and recip_c.ID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'Company List Updates - A' as Insertdata
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%B%'
		begin
			select @cmdInsert = '
			insert into '+trim(@cRecipientTablePath)+'PositionType (
				CompanyID,
				Code,
				Title,
				Priority,
				Active,
				ApprovedDate,
				EffectiveDate,
				ClosedDate,
				IsBudgeted,
				PayGradeTypeID,
				EEOTypeID,
				WorkerCompTypeID,
				SupervisorID,
				FTE,
				Description,
				Requirements,
				IsOTExempt,
				FLSATypeID,
				PR_Integration_PK
			)
			select
				recip_c.ID as CompanyID,
				donor_pt.Code,
				donor_pt.Title,
				donor_pt.Priority,
				donor_pt.Active,
				donor_pt.ApprovedDate,
				donor_pt.EffectiveDate,
				donor_pt.ClosedDate,
				donor_pt.IsBudgeted,
				recip_pgt.ID as PayGradeTypeID,
				recip_et.ID as EEOTypeID,
				recip_wct.ID as WorkerCompTypeID,
				recip_ee.ID as SupervisorID,
				donor_pt.FTE,
				donor_pt.Description,
				donor_pt.Requirements,
				donor_pt.IsOTExempt,
				recip_ft.ID as FLSATypeID,
				donor_pt.PR_Integration_PK
			from
				'+trim(@cDonorTablePath)+'PositionType donor_pt
			join '+trim(@cRecipientTablePath)+'Company recip_c on recip_c.ID = '+@cRecipientCompany_ID+'

			left join '+trim(@cDonorTablePath)+'PayGradeType donor_pgt on donor_pgt.ID = donor_pt.PayGradeTypeID
			left join '+trim(@cRecipientTablePath)+'PayGradeType recip_pgt on recip_pgt.Code = donor_pgt.Code and recip_pgt.Description = donor_pgt.Description and recip_pgt.CompanyID = recip_c.ID

			left join '+trim(@cDonorTablePath)+'EEOType donor_et on donor_et.ID = donor_pt.EEOTypeID
			left join '+trim(@cRecipientTablePath)+'EEOType recip_et on recip_et.Code = donor_et.Code and recip_et.Description = donor_et.Description and recip_et.CompanyID = recip_c.ID

			left join '+trim(@cDonorTablePath)+'WorkerCompType donor_wct on donor_wct.ID = donor_pt.WorkerCompTypeID
			left join '+trim(@cRecipientTablePath)+'WorkerCompType recip_wct on recip_wct.Code = donor_wct.Code and recip_wct.Description = donor_wct.Description and recip_wct.CompanyID = recip_c.ID

			left join '+trim(@cDonorTablePath)+'Employee donor_ee on donor_ee.ID = donor_pt.SupervisorID
			left join '+trim(@cRecipientTablePath)+'Employee recip_ee on recip_ee.EmployeeCode = donor_ee.EmployeeCode and recip_ee.CompanyID = recip_c.ID

			left join '+trim(@cDonorTablePath)+'FLSAType donor_ft on donor_ft.ID = donor_pt.FLSATypeID
			left join '+trim(@cRecipientTablePath)+'FLSAType recip_ft on recip_ft.Code = donor_ft.Code and recip_ft.Description = donor_ft.Description

			where donor_pt.CompanyID = '+@cDonorCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'PositionType - B' as Insertdata
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%C%'
		begin
			select @cmdInsert = '
				declare
					@recipAlertId int,
					@donorEmployeeIds nvarchar(max),
					@donorUserIds nvarchar(max),
					@recipientEmployeeIds nvarchar(max),
					@recipientUserIds nvarchar(max);

				declare alert_recipients_cursor cursor for
				select
					recip_a.ID,
					donor_a.RecipientKeysEmployee,
					donor_a.RecipientKeysUser
				from
					'+trim(@cRecipientTablePath)+'Alert recip_a
				join '+trim(@cDonorTablePath)+'Alert donor_a on donor_a.TemplateSubject = recip_a.TemplateSubject and donor_a.TemplateBody = recip_a.TemplateBody
				where
					recip_a.CompanyID = '+@cRecipientCompany_ID+' and
					donor_a.CompanyID = '+@cDonorCompany_ID+' and
					(donor_a.RecipientKeysEmployee is not null or donor_a.RecipientKeysUser is not null);

				open alert_recipients_cursor;
				fetch next from alert_recipients_cursor into @recipAlertId, @donorEmployeeIds, @donorUserIds;'
			select @cmdInsert = @cmdInsert + '
				while @@fetch_status = 0
				begin
					set @recipientEmployeeIds = null
					set @recipientUserIds = null

					;with EmployeeIDs as (
						select recip_ee.ID as eeId from string_split(@donorEmployeeIds, '','') donor_ae
						join '+trim(@cDonorTablePath)+'Employee donor_ee on donor_ee.ID = donor_ae.[value]
						join '+trim(@cRecipientTablePath)+'Employee recip_ee on recip_ee.EmployeeCode = donor_ee.EmployeeCode
						where recip_ee.CompanyID = '+@cRecipientCompany_ID+'
					)
					select @recipientEmployeeIds = coalesce(@recipientEmployeeIds + '','', '''') + cast(eeId as nvarchar) from EmployeeIDs

					;with UserIDs as (
						select recip_u.ID as userId from string_split(@donorUserIds, '','') donor_au
						join '+trim(@cDonorTablePath)+'HRnextUser donor_u on donor_u.ID = donor_au.[value]
						join '+trim(@cRecipientTablePath)+'HRnextUser recip_u on recip_u.Username = donor_u.Username
					)
					select @recipientUserIds = coalesce(@recipientUserIds + '','', '''') + cast(userId as nvarchar) from UserIDs

					update '+trim(@cRecipientTablePath)+'Alert set
					   RecipientKeysEmployee = @recipientEmployeeIds,
					   RecipientKeysUser = @recipientUserIds
					where ID = @recipAlertId

					fetch next from alert_recipients_cursor into @recipAlertId, @donorEmployeeIds, @donorUserIds;
				end

				close alert_recipients_cursor;
				deallocate alert_recipients_cursor;'

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'Alert Recipient Update - C' as Insertdata
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%D%'
		begin
			----------------QRWSavedReport
			select @cmdInsert = 'insert into '+trim(@cRecipientTablePath)+'QRWSavedReport (Name, Description, QRWConceptID, HRnextUserID, SelectedFields, CompanyID, ActiveEmployee, OrderBy, SimpleWhere, ComplexWhere, IsPublic)
			select T1.Name, T1.Description, T1.QRWConceptID, R2.ID, T1.SelectedFields, case when T1.CompanyID is null then null else '+@cRecipientCompany_ID+' end, T1.ActiveEmployee, T1.OrderBy, T1.SimpleWhere, T1.ComplexWhere, T1.IsPublic
			from '+@cDonorTablePath+'QRWSavedReport T1
			join '+@cDonorTablePath+'HRNextUser D2 on D2.ID = T1.HRNextUserID
			join '+@cDonorTablePath+'HRNextUserCompany D3 on D3.HRnextUserID = D2.ID
			join '+trim(@cRecipientTablePath)+'HRNextUser R2 on R2.Username = D2.Username
			where D3.CompanyID ='+ @cDonorCompany_ID +'or T1.CompanyID ='+ @cDonorCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'QRWSavedReport - D' as InsertData
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

		select  @cFailCodes = 'Delete Not Available At This Time'
	
	end
	
	select @cFailCodes as 'Return Code'

ExitPgm:
return 0
GO

/*	Now check to make sure it has been created (dbo.usp_EIN_Cons_CompanyUpdates ) */ 
	if object_id('dbo.usp_EIN_Cons_CompanyUpdates') is not null
		print 'Proc dbo.usp_EIN_Cons_CompanyUpdates has been CREATED Successfully. '
	else
		print 'Create Proc dbo.usp_EIN_Cons_CompanyUpdates FAILED'
GO

/*	now Grant Permissions on dbo.usp_EIN_Cons_CompanyUpdates to public */
	grant execute on dbo.usp_EIN_Cons_CompanyUpdates to public
	print 'Execute rights have been GRANTED to group public on usp_EIN_Cons_CompanyUpdates'
GO
  
/*-----------------------------------------------------------------
	eof -  usp_EIN_Cons_CompanyUpdates.sql 
-----------------------------------------------------------------*/