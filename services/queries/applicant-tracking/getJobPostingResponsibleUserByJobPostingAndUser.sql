select ATJobPostingID as aTJobPostingId,
	   HRnextUserID as hrNextUserId
from ATJobPostingResponsibleUser
where ATJobPostingID = @ATJobPostingID and
      HRnextUserID = @HRnextUserID