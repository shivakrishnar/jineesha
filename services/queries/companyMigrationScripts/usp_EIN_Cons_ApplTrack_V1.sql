/*-----------------------------------------------------------------
 usp_EIN_Cons_ApplTrack_V1
-----------------------------------------------------------------*/
/*
	Syntax	: exec  usp_EIN_Cons_ApplTrack_V1
		Ex.	: 	
			execute usp_EIN_Cons_ApplTrack_V1 '[adhr-1].[dbo].', '[adhr-2].[dbo].', 1, 0, '600373', '600351', 'ShowData', 'ZZZ'
			execute usp_EIN_Cons_ApplTrack_V1 '[adhr-1].[dbo].', '[adhr-2].[dbo].', 1, 0, '600373', '600351', 'Insert', 'N'
			execute usp_EIN_Cons_ApplTrack_V1 '[adhr-1].[dbo].', '[adhr-2].[dbo].', 1, 0, '600373', '600351', 'InsertFullValidate', 'ZZZ'
			execute usp_EIN_Cons_ApplTrack_V1 '[adhr-1].[dbo].', '[adhr-2].[dbo].', 1, 0, '600373', '600351', 'Delete', 'ZZZ'
		
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
/*	First Drop Proc dbo.usp_EIN_Cons_ApplTrack_V1 */
	if object_id('dbo.usp_EIN_Cons_ApplTrack_V1') is not null
	begin
		drop procedure dbo.usp_EIN_Cons_ApplTrack_V1
		print 'Dropped Proc dbo.usp_EIN_Cons_ApplTrack_V1 '
	end
GO

	create procedure usp_EIN_Cons_ApplTrack_V1
	
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

		--select @cmdShowDataDonor = 'select * from '+trim(@cDonorTablePath)+trim(@cTableName)+' where CompanyID = '+@cDonorCompany_ID
		--exec (@cmdShowDataDonor)
		--select @cmdShowDataRecipient = 'select * from '+trim(@cRecipientTablePath)+trim(@cTableName)+' where CompanyID = '+@cRecipientCompany_ID
		--exec (@cmdShowDataRecipient)

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%A%'
		begin
			----------------------ATJobposting
			select @cmdShowDataDonor = 'select R1.ID as PositionTypeID, R2.ID as WorkerCompTypeID, R3.ID as ATApplicationVersionID, 
			recipDiv1.ID as OrganizationType1ID, recipBranch2.ID as OrganizationType2ID, recipDep3.ID as OrganizationType3ID, recipTeam4.ID as OrganizationType4ID, null as OrganizationType5ID, T1.*
			from '+@cDonorTablePath+'ATJobposting T1

			join '+trim(@cRecipientTablePath)+'OrganizationStructure recip_org on recip_org.CompanyID = '+@cRecipientCompany_ID+'

			left outer join '+@cDonorTablePath+'PositionType D1on D1.CompanyID = T1.CompanyID and D1.ID = T1.PositionTypeID
			left outer join '+trim(@cRecipientTablePath)+'PositionType R1
				on R1.CompanyID = recip_org.CompanyID
				and ISNULL(D1.Code, '''') = ISNULL(R1.Code, '''')
				and ISNULL(D1.Description, '''') = ISNULL(R1.Description, '''')
				and ISNULL(D1.Title, '''') = ISNULL(R1.Title, '''')
				and isnull(convert(nvarchar(255), D1.ApprovedDate), '''') = isnull(convert(nvarchar(255), R1.ApprovedDate), '''')
				and isnull(convert(nvarchar(255), D1.EffectiveDate), '''') = isnull(convert(nvarchar(255), R1.EffectiveDate), '''')
				and isnull(convert(nvarchar(255), D1.ClosedDate), '''') = isnull(convert(nvarchar(255), R1.ClosedDate), '''')
				and ISNULL(D1.Requirements, '''') = ISNULL(R1.Requirements, '''')
				

			left outer join '+@cDonorTablePath+'WorkerCompType D2 on D2.CompanyID = T1.CompanyID and D2.ID = T1.WorkerCompTypeID
			left outer join '+trim(@cRecipientTablePath)+'WorkerCompType R2 on R2.CompanyID = recip_org.CompanyID and R2.Code = D2.Code and R2.Description = D2.Description

			left join '+@cDonorTablePath+'ATApplicationVersion D3 on D3.CompanyID = T1.CompanyID and D3.ID = T1.ATApplicationVersionID
			left join '+trim(@cRecipientTablePath)+'ATApplicationVersion R3 on R3.CompanyID = recip_org.CompanyID and R3.Title = D3.Title

			left join '+trim(@cDonorTablePath)+'OrganizationType donorDiv1 on ISNULL(T1.OrganizationType1ID, 0) = ISNULL(donorDiv1.ID, 0)
			left join '+trim(@cRecipientTablePath)+'OrganizationType recipDiv1 on
			recipDiv1.OrganizationStructureID = recip_org.ID and
			recipDiv1.Code = donorDiv1.Code and
			recipDiv1.Org1ParentID is null

			left join '+trim(@cDonorTablePath)+'OrganizationType donorBranch2 on ISNULL(donorBranch2.ID, 0) = ISNULL(T1.OrganizationType2ID, 0)
			left join '+trim(@cDonorTablePath)+'OrganizationType donorDiv2 on donorDiv2.ID = donorBranch2.Org1ParentID
			left join '+trim(@cRecipientTablePath)+'OrganizationType recipDiv2 on
				recipDiv2.OrganizationStructureID = recip_org.ID and
				recipDiv2.Code = donorDiv2.Code and
				recipDiv2.Org1ParentID is null
			left join '+trim(@cRecipientTablePath)+'OrganizationType recipBranch2 on
				recipBranch2.OrganizationStructureID = recip_org.ID and
				recipBranch2.Code = donorBranch2.Code and
				recipBranch2.Org1ParentID = recipDiv2.ID and
				recipBranch2.Org2ParentID is null

			left join '+trim(@cDonorTablePath)+'OrganizationType donorDep3 on donorDep3.ID = T1.OrganizationType3ID
			left join '+trim(@cDonorTablePath)+'OrganizationType donorBranch3 on donorBranch3.ID = donorDep3.Org2ParentID
			left join '+trim(@cDonorTablePath)+'OrganizationType donorDiv3 on donorDiv3.ID = donorDep3.Org1ParentID
			left join '+trim(@cRecipientTablePath)+'OrganizationType recipDiv3 on
				recipDiv3.OrganizationStructureID = recip_org.ID and
				recipDiv3.Code = donorDiv3.Code and
				recipDiv3.Org1ParentID is null
			left join '+trim(@cRecipientTablePath)+'OrganizationType recipBranch3 on
				recipBranch3.OrganizationStructureID = recip_org.ID and
				recipBranch3.Code = donorBranch3.Code and
				recipBranch3.Org1ParentID = recipDiv3.ID and
				recipBranch3.Org2ParentID is null
			left join '+trim(@cRecipientTablePath)+'OrganizationType recipDep3 on
				recipDep3.OrganizationStructureID = recip_org.ID and
				recipDep3.Code = donorDep3.Code and
				recipDep3.Org2ParentID = recipBranch3.ID and
				recipDep3.Org1ParentID = recipDiv3.ID and
				recipDep3.Org3ParentID is null'
			select @cmdShowDataDonor = @cmdShowDataDonor + '
			left join '+trim(@cDonorTablePath)+'OrganizationType donorTeam4 on donorTeam4.ID = T1.OrganizationType4ID
			left join '+trim(@cDonorTablePath)+'OrganizationType donorDep4 on donorDep4.ID = donorTeam4.Org3ParentID
			left join '+trim(@cDonorTablePath)+'OrganizationType donorBranch4 on donorBranch4.ID = donorTeam4.Org2ParentID
			left join '+trim(@cDonorTablePath)+'OrganizationType donorDiv4 on donorDiv4.ID = donorTeam4.Org1ParentID
			left join '+trim(@cRecipientTablePath)+'OrganizationType recipDiv4 on
				recipDiv4.OrganizationStructureID = recip_org.ID and
				recipDiv4.Code = donorDiv4.Code and
				recipDiv4.Org1ParentID is null
			left join '+trim(@cRecipientTablePath)+'OrganizationType recipBranch4 on
				recipBranch4.OrganizationStructureID = recip_org.ID and
				recipBranch4.Code = donorBranch4.Code and
				recipBranch4.Org1ParentID = recipDiv4.ID and
				recipBranch4.Org2ParentID is null
			left join '+trim(@cRecipientTablePath)+'OrganizationType recipDep4 on
				recipDep4.OrganizationStructureID = recip_org.ID and
				recipDep4.Code = donorDep4.Code and
				recipDep4.Org2ParentID = recipBranch4.ID and
				recipDep4.Org1ParentID = recipDiv4.ID and
				recipDep4.Org3ParentID is null
			left join '+trim(@cRecipientTablePath)+'OrganizationType recipTeam4 on
				recipTeam4.OrganizationStructureID = recip_org.ID and
				recipTeam4.Code = donorTeam4.Code and
				recipTeam4.Org3ParentID = recipDep4.ID and
				recipTeam4.Org2ParentID = recipBranch4.ID and
				recipTeam4.Org1ParentID = recipDiv4.ID and
				recipTeam4.Org4ParentID is null

			where T1.CompanyID ='+ @cDonorCompany_ID

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'ATJobPosting - A' as ShowData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%B%'
		begin
			----------------------ATApplication
			select @cmdShowDataDonor = '
			select R1.ID, R2.ID, T1.*
			from '+@cDonorTablePath+'ATApplication T1

			join '+@cDonorTablePath+'ATJobPosting D1 on D1.ID = T1.ATJobPostingID
			join '+trim(@cRecipientTablePath)+'ATJobPosting R1 on R1.Title = D1.Title

			left join '+@cDonorTablePath+'ATSoftStatusType D2 on D2.ID = T1.ATSoftStatusTypeID and D2.CompanyID = D1.CompanyID
			left outer join '+trim(@cRecipientTablePath)+'ATSoftStatusType R2 on R2.Title = D2.Title and R2.CompanyID = R1.CompanyID

			where D1.CompanyID = '+@cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'ATApplication - B' as ShowData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%C%'
		begin
			-----------------ATApplicationNote
			select @cmdShowDataDonor = 'select R1.Id, T1.ATApplicationID, NoteEntryDate, NoteEnteredByUsername, Note
			from '+@cDonorTablePath+'ATApplicationNote T1 
			join '+@cDonorTablePath+'ATApplication D1 on D1.ID = T1.ATApplicationID
			left outer join '+@cRecipientTablePath+'ATApplication R1 on R1.ATApplicationKey = D1.ATApplicationKey
			join '+@cDonorTablePath+'ATJobPosting D2 on D2.ID = D1.ATJobPostingID
			where D2.CompanyID ='+ @cDonorCompany_ID--+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'ATApplicationNote - C' as ShowData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%D%'
		begin
			-----------------ATApplicationStatusHistory
			select @cmdShowDataDonor = '
			select recip_at.ID as ATApplicationID, donor_ash.StatusChangedDate, donor_ash.StatusChangedByUsername, donor_ash.ChangedStatusTitle
			from '+@cDonorTablePath+'ATApplicationStatusHistory donor_ash
			join '+@cDonorTablePath+'ATApplication donor_at on donor_at.ID = donor_ash.ATApplicationID
			join '+@cRecipientTablePath+'ATApplication recip_at on recip_at.ATApplicationKey = donor_at.ATApplicationKey
			join '+@cDonorTablePath+'ATJobPosting donor_jp on donor_jp.ID = donor_at.ATJobPostingID
			join '+@cRecipientTablePath+'ATJobPosting recip_jp on recip_jp.ID = recip_at.ATJobPostingID
			where donor_jp.CompanyID = '+@cDonorCompany_ID+' and recip_jp.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'ATApplicationStatusHistory - D' as ShowData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%E%'
		begin
			-----------------ATApplicationVersionCustomQuestion
			select @cmdShowDataDonor = 'select distinct r1.id, R2.ID, T1.*
			from '+@cDonorTablePath+'ATApplicationVersionCustomQuestion T1 
			join '+@cDonorTablePath+'ATApplicationVersion D1 on D1.ID = T1.ATApplicationVersionID
			left outer join '+@cRecipientTablePath+'ATApplicationVersion R1 on R1.Title = D1.Title
			join '+@cDonorTablePath+'ATQuestionBank D2 on D2.CompanyID = D1.CompanyID and D2.ID = T1.ATQuestionBankID
			join '+@cRecipientTablePath+'ATQuestionBank R2 on R2.CompanyID = R1.CompanyID and R2.ATQuestionTypeID = D2.ATQuestionTypeID and R2.QuestionTitle = D2.QuestionTitle
			where D1.CompanyID ='+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'ATApplicationVersionCustomQuestion - E' as ShowData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%F%'
		begin
			-----------------ATApplicationQuestionBankAnswer
			select @cmdShowDataDonor = 'select R1.Id, T1.ATApplicationID, OriginalATQuestionTypeID, OriginalQuestionText, AnswerDate, AnswerYesNo, AnswerFreeForm, AnswerMultipleChoice
			from '+@cDonorTablePath+'ATApplicationQuestionBankAnswer T1 
			join '+@cDonorTablePath+'ATApplication D1 on D1.ID = T1.ATApplicationID
			left outer join '+@cRecipientTablePath+'ATApplication R1 on R1.ATApplicationKey = D1.ATApplicationKey
			join '+@cDonorTablePath+'ATJobPosting D2 on D2.ID = D1.ATJobPostingID
			where D2.CompanyID ='+ @cDonorCompany_ID--+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'ATApplicationQuestionBankAnswer - F' as ShowData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%G%'
		begin
			----------------------ATJobPostingResponsibleUser
			select @cmdShowDataDonor = 'select R1.ID, R2.ID, T1.*
			from '+@cDonorTablePath+'ATJobPostingResponsibleUser T1
			join '+@cDonorTablePath+'ATJobPosting D1 on D1.ID = T1.ATJobPostingID
			left outer join '+trim(@cRecipientTablePath)+'ATJobPosting R1 on R1.Title = D1.Title
			join '+@cDonorTablePath+'HRNextUser D2 on D2.ID = T1.HRNextUSerID
			join '+trim(@cRecipientTablePath)+'HRNextUser R2 on R2.Username = D2.Username
			where D1.CompanyID ='+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'ATJobPostingResponsibleUser - G' as ShowData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%H%'
		begin
			-----------------ATQuestionBankMultipleChoiceAnswers
			select @cmdShowDataDonor = 'select R1.Id, ATQuestionBankID, Answer
			from '+@cDonorTablePath+'ATQuestionBankMultipleChoiceAnswers T1 
			join '+@cDonorTablePath+'ATQuestionBank D1 on D1.ID = T1.ATQuestionBankID
			left outer join '+@cRecipientTablePath+'ATQuestionBank R1 on R1.QuestionTitle = D1.QuestionTitle
			where D1.CompanyID ='+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'ATQuestionBankMultipleChoiceAnswers - H' as ShowData
			end
		end

		select @cFailCodes = 'ShowData'-- Not Available At This Time'
	
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
			----------------------ATJobposting
			-- TODO: (MJ-9388) deal with PositionTypes that are duplicated
			select @cmdInsert = 'insert into '+@cRecipientTablePath+'ATJobposting (CompanyID, ATApplicationVersionID, PositionTypeID, OrganizationType1ID, OrganizationType2ID, OrganizationType3ID, OrganizationType4ID, OrganizationType5ID, WorkerCompTypeID, Title, Description, LinkKey, IsOpen, JazzHrPositionOpeningID)
			select recip_org.CompanyID, R3.ID as ATApplicationVersionID, R1.ID as PositionTypeID, recipDiv1.ID as OrganizationType1ID, recipBranch2.ID as OrganizationType2ID, recipDep3.ID as OrganizationType3ID, recipTeam4.ID as OrganizationType4ID, null as OrganizationType5ID, R2.ID as WorkerCompTypeID,  
			T1.Title, T1.Description, T1.LinkKey, T1.IsOpen, T1.JazzHrPositionOpeningID
			from '+@cDonorTablePath+'ATJobposting T1

			join '+trim(@cRecipientTablePath)+'OrganizationStructure recip_org on recip_org.CompanyID = '+@cRecipientCompany_ID+'

			left outer join '+@cDonorTablePath+'PositionType D1 on D1.CompanyID = T1.CompanyID and D1.ID = T1.PositionTypeID
			left outer join '+trim(@cRecipientTablePath)+'PositionType R1
				on R1.CompanyID = recip_org.CompanyID
				and ISNULL(D1.Code, '''') = ISNULL(R1.Code, '''')
				and ISNULL(D1.Description, '''') = ISNULL(R1.Description, '''')
				and ISNULL(D1.Title, '''') = ISNULL(R1.Title, '''')
				and isnull(convert(nvarchar(255), D1.ApprovedDate), '''') = isnull(convert(nvarchar(255), R1.ApprovedDate), '''')
				and isnull(convert(nvarchar(255), D1.EffectiveDate), '''') = isnull(convert(nvarchar(255), R1.EffectiveDate), '''')
				and isnull(convert(nvarchar(255), D1.ClosedDate), '''') = isnull(convert(nvarchar(255), R1.ClosedDate), '''')
				and ISNULL(D1.Requirements, '''') = ISNULL(R1.Requirements, '''')
				

			left outer join '+@cDonorTablePath+'WorkerCompType D2 on D2.CompanyID = T1.CompanyID and D2.ID = T1.WorkerCompTypeID
			left outer join '+trim(@cRecipientTablePath)+'WorkerCompType R2 on R2.CompanyID = recip_org.CompanyID and R2.Code = D2.Code and R2.Description = D2.Description

			left join '+@cDonorTablePath+'ATApplicationVersion D3 on D3.CompanyID = T1.CompanyID and D3.ID = T1.ATApplicationVersionID
			left join '+trim(@cRecipientTablePath)+'ATApplicationVersion R3 on R3.CompanyID = recip_org.CompanyID and R3.Title = D3.Title

			left join '+trim(@cDonorTablePath)+'OrganizationType donorDiv1 on ISNULL(T1.OrganizationType1ID, 0) = ISNULL(donorDiv1.ID, 0)
			left join '+trim(@cRecipientTablePath)+'OrganizationType recipDiv1 on
			recipDiv1.OrganizationStructureID = recip_org.ID and
			recipDiv1.Code = donorDiv1.Code and
			recipDiv1.Org1ParentID is null

			left join '+trim(@cDonorTablePath)+'OrganizationType donorBranch2 on ISNULL(donorBranch2.ID, 0) = ISNULL(T1.OrganizationType2ID, 0)
			left join '+trim(@cDonorTablePath)+'OrganizationType donorDiv2 on donorDiv2.ID = donorBranch2.Org1ParentID
			left join '+trim(@cRecipientTablePath)+'OrganizationType recipDiv2 on
				recipDiv2.OrganizationStructureID = recip_org.ID and
				recipDiv2.Code = donorDiv2.Code and
				recipDiv2.Org1ParentID is null
			left join '+trim(@cRecipientTablePath)+'OrganizationType recipBranch2 on
				recipBranch2.OrganizationStructureID = recip_org.ID and
				recipBranch2.Code = donorBranch2.Code and
				recipBranch2.Org1ParentID = recipDiv2.ID and
				recipBranch2.Org2ParentID is null

			left join '+trim(@cDonorTablePath)+'OrganizationType donorDep3 on donorDep3.ID = T1.OrganizationType3ID
			left join '+trim(@cDonorTablePath)+'OrganizationType donorBranch3 on donorBranch3.ID = donorDep3.Org2ParentID
			left join '+trim(@cDonorTablePath)+'OrganizationType donorDiv3 on donorDiv3.ID = donorDep3.Org1ParentID
			left join '+trim(@cRecipientTablePath)+'OrganizationType recipDiv3 on
				recipDiv3.OrganizationStructureID = recip_org.ID and
				recipDiv3.Code = donorDiv3.Code and
				recipDiv3.Org1ParentID is null
			left join '+trim(@cRecipientTablePath)+'OrganizationType recipBranch3 on
				recipBranch3.OrganizationStructureID = recip_org.ID and
				recipBranch3.Code = donorBranch3.Code and
				recipBranch3.Org1ParentID = recipDiv3.ID and
				recipBranch3.Org2ParentID is null
			left join '+trim(@cRecipientTablePath)+'OrganizationType recipDep3 on
				recipDep3.OrganizationStructureID = recip_org.ID and
				recipDep3.Code = donorDep3.Code and
				recipDep3.Org2ParentID = recipBranch3.ID and
				recipDep3.Org1ParentID = recipDiv3.ID and
				recipDep3.Org3ParentID is null'
			select @cmdInsert = @cmdInsert + '
			left join '+trim(@cDonorTablePath)+'OrganizationType donorTeam4 on donorTeam4.ID = T1.OrganizationType4ID
			left join '+trim(@cDonorTablePath)+'OrganizationType donorDep4 on donorDep4.ID = donorTeam4.Org3ParentID
			left join '+trim(@cDonorTablePath)+'OrganizationType donorBranch4 on donorBranch4.ID = donorTeam4.Org2ParentID
			left join '+trim(@cDonorTablePath)+'OrganizationType donorDiv4 on donorDiv4.ID = donorTeam4.Org1ParentID
			left join '+trim(@cRecipientTablePath)+'OrganizationType recipDiv4 on
				recipDiv4.OrganizationStructureID = recip_org.ID and
				recipDiv4.Code = donorDiv4.Code and
				recipDiv4.Org1ParentID is null
			left join '+trim(@cRecipientTablePath)+'OrganizationType recipBranch4 on
				recipBranch4.OrganizationStructureID = recip_org.ID and
				recipBranch4.Code = donorBranch4.Code and
				recipBranch4.Org1ParentID = recipDiv4.ID and
				recipBranch4.Org2ParentID is null
			left join '+trim(@cRecipientTablePath)+'OrganizationType recipDep4 on
				recipDep4.OrganizationStructureID = recip_org.ID and
				recipDep4.Code = donorDep4.Code and
				recipDep4.Org2ParentID = recipBranch4.ID and
				recipDep4.Org1ParentID = recipDiv4.ID and
				recipDep4.Org3ParentID is null
			left join '+trim(@cRecipientTablePath)+'OrganizationType recipTeam4 on
				recipTeam4.OrganizationStructureID = recip_org.ID and
				recipTeam4.Code = donorTeam4.Code and
				recipTeam4.Org3ParentID = recipDep4.ID and
				recipTeam4.Org2ParentID = recipBranch4.ID and
				recipTeam4.Org1ParentID = recipDiv4.ID and
				recipTeam4.Org4ParentID is null

			where T1.CompanyID ='+ @cDonorCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'ATJobPosting - A' as InsertData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%B%'
		begin
			----------------------ATApplication - ATJobPosting needs to be loaded first
			select @cmdInsert = 'insert into '+@cRecipientTablePath+'ATApplication (ATSoftStatusTypeID, ATApplicationKey, ReceivedDate, FirstName, MiddleName, LastName, Address1, Address2, City, Zip, CountryStateTypeID, EmailAddress, PhoneHome, PhoneCell, BirthDate, SSN, AlternateTaxNumber, PreviousAddress, LengthAtCurrentAddress, PreviousEmployer1MayWeContact, PreviousEmployer1CompanyName, PreviousEmployer1Address, PreviousEmployer1City, PreviousEmployer1CountryStateTypeID, PreviousEmployer1Phone, PreviousEmployer1SupervisorName, PreviousEmployer1SupervisorTitle, PreviousEmployer1Duties, PreviousEmployer1LeavingReasons, PreviousEmployer1StartingPay, PreviousEmployer1EndingPay, PreviousEmployer1StartDate, PreviousEmployer1EndDate, PreviousEmployer2MayWeContact, PreviousEmployer2CompanyName, PreviousEmployer2Address, PreviousEmployer2City, PreviousEmployer2CountryStateTypeID, PreviousEmployer2Phone, PreviousEmployer2SupervisorName, PreviousEmployer2SupervisorTitle, PreviousEmployer2Duties, PreviousEmployer2LeavingReasons, PreviousEmployer2StartingPay, PreviousEmployer2EndingPay, PreviousEmployer2StartDate, PreviousEmployer2EndDate, PreviousEmployer3MayWeContact, PreviousEmployer3CompanyName, PreviousEmployer3Address, PreviousEmployer3City, PreviousEmployer3CountryStateTypeID, PreviousEmployer3Phone, PreviousEmployer3SupervisorName, PreviousEmployer3SupervisorTitle, PreviousEmployer3Duties, PreviousEmployer3LeavingReasons, PreviousEmployer3StartingPay, PreviousEmployer3EndingPay, PreviousEmployer3StartDate, PreviousEmployer3EndDate, WorkHistoryConditionsThatLimitAbility, WorkHistoryConditionsHowCanWeAccommodate, WorkHistoryUSLegal, WorkHistoryConvictedOfFelony, WorkHistoryConvictedOfFelonyReasons, EducationHistory1EducationLevelTypeID, EducationHistory1Institution, EducationHistory1Major, EducationHistory1Minor, EducationHistory1CompletedDate, EducationHistory2EducationLevelTypeID, EducationHistory2Institution, EducationHistory2Major, EducationHistory2Minor, EducationHistory2CompletedDate, EducationHistory3EducationLevelTypeID, EducationHistory3Institution, EducationHistory3Major, EducationHistory3Minor, EducationHistory3CompletedDate, ICertifyStatement, KeywordList, Rating, Archived, ATJobPostingID, EsignName, EsignStamptedDateTime, FormMakeOffer, IsWorkflowOfferAccepted, IsWorkflowOfferRejected, EsignNameOffer, EsignStamptedDateTimeOffer, ReferralSource, FormRejectApplication, IsVetStatus_Disabled, IsVetStatus_RecentlySeparated, IsVetStatus_ActiveDutyWartime, IsVetStatus_AFServiceMedal, VetStatus_DischargeDate, VetStatus_MilitaryReserve, VetStatus_Veteran, IsVetStatus_VietnamEra, IsVetStatus_Other, ExternalCandidateID, ExternalSystem, Gender, ApplyDate, PreviousEmployer1Title, PreviousEmployer2Title, PreviousEmployer3Title, SchemeID, SchemeAgencyID, PositionOpeningID, PositionSchemeID, PositionAgencyID, PositionUri, Status, StatusCategory, StatusTransitionDateTime, EducationLevelCode, Citizenship, RequestJSON, DateAdded, ProfileID)
			select R2.ID as ATSoftStatusTypeID, T1.ATApplicationKey, ReceivedDate, FirstName, MiddleName, LastName, Address1, Address2, City, Zip, CountryStateTypeID, EmailAddress, PhoneHome, PhoneCell, BirthDate, SSN, AlternateTaxNumber, PreviousAddress, LengthAtCurrentAddress, PreviousEmployer1MayWeContact, PreviousEmployer1CompanyName, PreviousEmployer1Address, PreviousEmployer1City, PreviousEmployer1CountryStateTypeID, PreviousEmployer1Phone, PreviousEmployer1SupervisorName, PreviousEmployer1SupervisorTitle, PreviousEmployer1Duties, PreviousEmployer1LeavingReasons, PreviousEmployer1StartingPay, PreviousEmployer1EndingPay, PreviousEmployer1StartDate, PreviousEmployer1EndDate, PreviousEmployer2MayWeContact, PreviousEmployer2CompanyName, PreviousEmployer2Address, PreviousEmployer2City, PreviousEmployer2CountryStateTypeID, PreviousEmployer2Phone, PreviousEmployer2SupervisorName, PreviousEmployer2SupervisorTitle, PreviousEmployer2Duties, PreviousEmployer2LeavingReasons, PreviousEmployer2StartingPay, PreviousEmployer2EndingPay, PreviousEmployer2StartDate, PreviousEmployer2EndDate, PreviousEmployer3MayWeContact, PreviousEmployer3CompanyName, PreviousEmployer3Address, PreviousEmployer3City, PreviousEmployer3CountryStateTypeID, PreviousEmployer3Phone, PreviousEmployer3SupervisorName, PreviousEmployer3SupervisorTitle, PreviousEmployer3Duties, PreviousEmployer3LeavingReasons, PreviousEmployer3StartingPay, PreviousEmployer3EndingPay, PreviousEmployer3StartDate, PreviousEmployer3EndDate, WorkHistoryConditionsThatLimitAbility, WorkHistoryConditionsHowCanWeAccommodate, WorkHistoryUSLegal, WorkHistoryConvictedOfFelony, WorkHistoryConvictedOfFelonyReasons, EducationHistory1EducationLevelTypeID, EducationHistory1Institution, EducationHistory1Major, EducationHistory1Minor, EducationHistory1CompletedDate, EducationHistory2EducationLevelTypeID, EducationHistory2Institution, EducationHistory2Major, EducationHistory2Minor, EducationHistory2CompletedDate, EducationHistory3EducationLevelTypeID, EducationHistory3Institution, EducationHistory3Major, EducationHistory3Minor, EducationHistory3CompletedDate, ICertifyStatement, KeywordList, Rating, Archived, R1.ID as ATJobPostingID, EsignName, EsignStamptedDateTime, FormMakeOffer, IsWorkflowOfferAccepted, IsWorkflowOfferRejected, EsignNameOffer, EsignStamptedDateTimeOffer, ReferralSource, FormRejectApplication, IsVetStatus_Disabled, IsVetStatus_RecentlySeparated, IsVetStatus_ActiveDutyWartime, IsVetStatus_AFServiceMedal, VetStatus_DischargeDate, VetStatus_MilitaryReserve, VetStatus_Veteran, IsVetStatus_VietnamEra, IsVetStatus_Other, ExternalCandidateID, ExternalSystem, Gender, ApplyDate, PreviousEmployer1Title, PreviousEmployer2Title, PreviousEmployer3Title, SchemeID, SchemeAgencyID, PositionOpeningID, PositionSchemeID, PositionAgencyID, PositionUri, Status, StatusCategory, StatusTransitionDateTime, EducationLevelCode, Citizenship, RequestJSON, DateAdded, ProfileID
			from '+@cDonorTablePath+'ATApplication T1

			join '+@cDonorTablePath+'ATJobPosting D1 on D1.ID = T1.ATJobPostingID
			join '+trim(@cRecipientTablePath)+'ATJobPosting R1 on R1.Title = D1.Title

			left join '+@cDonorTablePath+'ATSoftStatusType D2 on D2.ID = T1.ATSoftStatusTypeID and D2.CompanyID = D1.CompanyID
			left outer join '+trim(@cRecipientTablePath)+'ATSoftStatusType R2 on R2.Title = D2.Title and R2.CompanyID = R1.CompanyID

			where D1.CompanyID = '+@cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'ATApplication - B' as InsertData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%C%'
		begin
			-----------------ATApplicationNote
			select @cmdInsert = 'insert into '+@cRecipientTablePath+'ATApplicationNote (ATApplicationID, NoteEntryDate, NoteEnteredByUsername, Note)
			select R1.Id, NoteEntryDate, NoteEnteredByUsername, Note
			from '+@cDonorTablePath+'ATApplicationNote T1 
			join '+@cDonorTablePath+'ATApplication D1 on D1.ID = T1.ATApplicationID
			left outer join '+@cRecipientTablePath+'ATApplication R1 on R1.ATApplicationKey = D1.ATApplicationKey
			join '+@cDonorTablePath+'ATJobPosting D2 on D2.ID = D1.ATJobPostingID
			where D2.CompanyID ='+ @cDonorCompany_ID--+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'ATApplicationNote - C' as InsertData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%D%'
		begin
			-----------------ATApplicationStatusHistory - ATApplication needs to be loaded first
			select @cmdInsert = 'insert into '+@cRecipientTablePath+'ATApplicationStatusHistory (ATApplicationID, StatusChangedDate, StatusChangedByUsername, ChangedStatusTitle)
			select recip_at.ID as ATApplicationID, donor_ash.StatusChangedDate, donor_ash.StatusChangedByUsername, donor_ash.ChangedStatusTitle
			from '+@cDonorTablePath+'ATApplicationStatusHistory donor_ash
			join '+@cDonorTablePath+'ATApplication donor_at on donor_at.ID = donor_ash.ATApplicationID
			join '+@cRecipientTablePath+'ATApplication recip_at on recip_at.ATApplicationKey = donor_at.ATApplicationKey
			join '+@cDonorTablePath+'ATJobPosting donor_jp on donor_jp.ID = donor_at.ATJobPostingID
			join '+@cRecipientTablePath+'ATJobPosting recip_jp on recip_jp.ID = recip_at.ATJobPostingID
			where donor_jp.CompanyID = '+@cDonorCompany_ID+' and recip_jp.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'ATApplicationStatusHistory - D' as InsertData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%E%'
		begin
			-----------------ATApplicationVersionCustomQuestion
			select @cmdInsert = 'insert into '+@cRecipientTablePath+'ATApplicationVersionCustomQuestion (ATApplicationVersionID, ATQuestionBankID)
			select distinct r1.id, R2.ID
			from '+@cDonorTablePath+'ATApplicationVersionCustomQuestion T1 
			join '+@cDonorTablePath+'ATApplicationVersion D1 on D1.ID = T1.ATApplicationVersionID
			left outer join '+@cRecipientTablePath+'ATApplicationVersion R1 on isnull(R1.Title,0) = isnull(D1.Title,0)
			join '+@cDonorTablePath+'ATQuestionBank D2 on D2.CompanyID = D1.CompanyID and D2.ID = T1.ATQuestionBankID
			join '+@cRecipientTablePath+'ATQuestionBank R2 on R2.CompanyID = R1.CompanyID and R2.ATQuestionTypeID = D2.ATQuestionTypeID and isnull(R2.QuestionTitle,0) = isnull(D2.QuestionTitle,0)
			where D1.CompanyID ='+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'ATApplicationVersionCustomQuestion - E' as InsertData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%F%'
		begin
			-----------------ATApplicationQuestionBankAnswer
			select @cmdInsert = 'insert into '+@cRecipientTablePath+'ATApplicationQuestionBankAnswer (ATApplicationID, OriginalATQuestionTypeID, OriginalQuestionText, AnswerDate, AnswerYesNo, AnswerFreeForm, AnswerMultipleChoice)
			select distinct R1.Id, T1.OriginalATQuestionTypeID, OriginalQuestionText, AnswerDate, AnswerYesNo, AnswerFreeForm, AnswerMultipleChoice
			from '+@cDonorTablePath+'ATApplicationQuestionBankAnswer T1 
			join '+@cDonorTablePath+'ATApplication D1 on D1.ID = T1.ATApplicationID
			left outer join '+@cRecipientTablePath+'ATApplication R1 on R1.ATApplicationKey = D1.ATApplicationKey
			join '+@cDonorTablePath+'ATJobPosting D2 on D2.ID = D1.ATJobPostingID
			where D2.CompanyID ='+ @cDonorCompany_ID--+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'ATApplicationQuestionBankAnswer - F' as InsertData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%G%'
		begin
			----------------------ATJobPostingResponsibleUser
			select @cmdInsert = 'insert into '+@cRecipientTablePath+'ATJobPostingResponsibleUser (ATJobPostingID, HRnextUserID)
			select R1.ID, R2.ID
			from '+@cDonorTablePath+'ATJobPostingResponsibleUser T1
			join '+@cDonorTablePath+'ATJobPosting D1 on D1.ID = T1.ATJobPostingID
			left outer join '+trim(@cRecipientTablePath)+'ATJobPosting R1 on isnull(R1.Title,0) = isnull(D1.Title,0)
			join '+@cDonorTablePath+'HRNextUser D2 on D2.ID = T1.HRNextUSerID
			join '+trim(@cRecipientTablePath)+'HRNextUser R2 on R2.Username = D2.Username
			where D1.CompanyID ='+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'ATJobPostingResponsibleUser - G' as InsertData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%H%'
		begin
			-----------------ATQuestionBankMultipleChoiceAnswers
			select @cmdInsert = 'insert into '+@cRecipientTablePath+'ATQuestionBankMultipleChoiceAnswers (ATQuestionBankID, Answer)
			select R1.Id, Answer
			from '+@cDonorTablePath+'ATQuestionBankMultipleChoiceAnswers T1 
			join '+@cDonorTablePath+'ATQuestionBank D1 on D1.ID = T1.ATQuestionBankID
			left outer join '+@cRecipientTablePath+'ATQuestionBank R1 on isnull(R1.QuestionTitle,0) = isnull(D1.QuestionTitle,0)
			where D1.CompanyID ='+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'ATQuestionBankMultipleChoiceAnswers - H' as InsertData
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

/*	Now check to make sure it has been created (dbo.usp_EIN_Cons_ApplTrack_V1 ) */ 
	if object_id('dbo.usp_EIN_Cons_ApplTrack_V1') is not null
		print 'Proc dbo.usp_EIN_Cons_ApplTrack_V1 has been CREATED Successfully. '
	else
		print 'Create Proc dbo.usp_EIN_Cons_ApplTrack_V1 FAILED'
GO

/*	now Grant Permissions on dbo.usp_EIN_Cons_ApplTrack_V1 to public */
	grant execute on dbo.usp_EIN_Cons_ApplTrack_V1 to public
	print 'Execute rights have been GRANTED to group public on usp_EIN_Cons_ApplTrack_V1'
GO
  
/*-----------------------------------------------------------------
	eof -  usp_EIN_Cons_ApplTrack_V1.sql 
-----------------------------------------------------------------*/