-- Development/demo campaigns used by the current KVD frontend.
INSERT INTO campaigns (id,title,description,category,location,goal_amount,raised_amount,status,end_date)
VALUES
('00000000-0000-4000-8000-000000000001','Keep a child in school','Books, uniforms and learning materials for students who need a stronger start.','Education','Nairobi',300000,182500,'active',CURRENT_DATE + 18),
('00000000-0000-4000-8000-000000000002','A clinic for the community','Essential healthcare and maternal support closer to families.','Healthcare','Kisumu',500000,412000,'active',CURRENT_DATE + 11),
('00000000-0000-4000-8000-000000000003','Meals for 500 families','A community-led food drive providing nutritious meals this month.','Food','Nairobi',150000,97500,'active',CURRENT_DATE + 8),
('00000000-0000-4000-8000-000000000004','Restore our local forest','Plant native trees and protect a vital green space for future generations.','Environment','Kiambu',120000,64000,'active',CURRENT_DATE + 26),
('00000000-0000-4000-8000-000000000005','Digital skills for teens','Practical technology and career skills for young people.','Education','Mombasa',250000,210000,'active',CURRENT_DATE + 14),
('00000000-0000-4000-8000-000000000006','Mental wellness outreach','Safe spaces and counselling sessions for young people.','Healthcare','Nairobi',200000,138000,'active',CURRENT_DATE + 21)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description, category=EXCLUDED.category,
  location=EXCLUDED.location, goal_amount=EXCLUDED.goal_amount, status=EXCLUDED.status,
  end_date=EXCLUDED.end_date;
