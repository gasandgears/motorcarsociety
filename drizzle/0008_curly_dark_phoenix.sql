ALTER TABLE `cars` ADD `short_description` text DEFAULT '' NOT NULL;--> statement-breakpoint
UPDATE `cars` SET `short_description` = 'Ford built the Boss 302 with a very specific purpose. It was created around the Trans-Am racing program, combining the Mustang SportsRoof body with a high-revving 302-cubic-inch small-block, four-speed manual transmission, upgraded suspension, better brakes, and one of the strongest visual packages Ford offered in 1970.

Finished in Grabber Blue, this Boss 302 has exactly the kind of presence these cars deserve. The bright blue paint against the black Boss graphics makes the shape of the 1970 Mustang work particularly well, while the front spoiler, rear window slats, rear deck spoiler, Magnum-style wheels, and aggressive stance give it a look that is immediately identifiable without becoming overdone.

The car is represented with an extensive history file that includes ownership information, restoration records, service documentation, inspection material, and supporting photographs. Rather than simply presenting the car on appearance alone, the available documentation provides a much clearer picture of what has been done to it and how it has been maintained.'
WHERE `id` = '856aea06-d11f-4785-929a-00164cd6571e';
