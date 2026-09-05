ALTER TABLE `cars` ADD `exterior_color` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `cars` ADD `interior_color` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `cars` ADD `mileage` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `cars` ADD `body_style` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `cars` ADD `engine` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `cars` ADD `transmission` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `cars` ADD `drivetrain` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `cars` ADD `registry_id` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `cars` ADD `overview` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `cars` ADD `highlights` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `cars` ADD `condition_summary` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `cars` ADD `provenance` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `cars` ADD `restoration_summary` text DEFAULT '' NOT NULL;--> statement-breakpoint
UPDATE `cars` SET
  `exterior_color` = 'Grabber Blue',
  `interior_color` = 'Black',
  `body_style` = 'SportsRoof fastback',
  `engine` = '302 cu in Boss V8',
  `transmission` = '4-speed manual',
  `drivetrain` = 'Rear-wheel drive',
  `registry_id` = 'TEST-1970-BOSS302-002',
  `overview` = 'A striking Grabber Blue example of Ford’s homologation-era Boss 302, presented as an older preservation-oriented restoration with supporting records. The private file documents a four-owner history, identity and drivetrain review, restoration work, condition inspection and a comprehensive photo record.\n\nThe car is represented as a well-kept driver-quality example rather than a freshly completed show restoration. No claim of matching-numbers authenticity, competition use or concours history is made.',
  `highlights` = 'Iconic Grabber Blue exterior\n302 cu in Boss V8 with period-style four-barrel carburetion\n4-speed manual transmission\nFour-owner history represented in the private file\nCosmetic and mechanical restoration completed 1999–2000\nIdentity, body-stamping and data-plate photographs retained\nEngine, transmission, undercarriage and interior documentation\nAlways-garaged ownership history represented in the test file',
  `condition_summary` = 'The inspection describes a uniform Grabber Blue finish with minor chips consistent with an older restoration. The engine bay presents cleanly in period style, while the black interior shows light wear and correct-style trim. The undercarriage reflects normal road use with no major corrosion noted in the test inspection. Brakes and steering were recorded as serviceable, and period-style wheels wear modern service tires.',
  `restoration_summary` = 'A preservation-oriented cosmetic and mechanical restoration was completed from 1999 through 2000. Documented work includes body stripping and corrosion repair, panel alignment, a Grabber Blue refinish, underhood detailing, engine resealing and cylinder-head service, transmission rebuild with clutch and linkage work, suspension and brake service, wheel bearings, interior trim, carpet and weatherstripping. Sample invoices, selected photographs, parts receipts and service notes are retained in the file.',
  `provenance` = 'The represented history begins with delivery in Southern California in 1970 and follows the car through four private owners in California and Arizona. Supporting records cover ownership, restoration and identity review. The current test packet is fictional and exists for Registry workflow evaluation; it is not an authenticity certification, appraisal or legal ownership record.'
WHERE `id` = '856aea06-d11f-4785-929a-00164cd6571e';
