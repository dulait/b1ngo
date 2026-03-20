using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace B1ngo.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedReferenceData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "session_types",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    name = table.Column<string>(type: "varchar(50)", nullable: false),
                    display_name = table.Column<string>(type: "varchar(100)", nullable: false),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_session_types", x => x.id);
                }
            );

            migrationBuilder.CreateTable(
                name: "grand_prix",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    name = table.Column<string>(type: "varchar(100)", nullable: false),
                    season = table.Column<int>(type: "integer", nullable: false),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_grand_prix", x => x.id);
                }
            );

            migrationBuilder.CreateTable(
                name: "event_pool_entries",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    session_type_id = table.Column<int>(type: "integer", nullable: false),
                    event_key = table.Column<string>(type: "varchar(100)", nullable: false),
                    display_text = table.Column<string>(type: "varchar(200)", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_event_pool_entries", x => x.id);
                    table.ForeignKey(
                        name: "FK_event_pool_entries_session_types_session_type_id",
                        column: x => x.session_type_id,
                        principalTable: "session_types",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "IX_event_pool_entries_session_type_id_event_key",
                table: "event_pool_entries",
                columns: new[] { "session_type_id", "event_key" },
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "IX_grand_prix_name_season",
                table: "grand_prix",
                columns: new[] { "name", "season" },
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "IX_session_types_name",
                table: "session_types",
                column: "name",
                unique: true
            );

            // Seed session types (IDs 1-7)
            migrationBuilder.InsertData(
                table: "session_types",
                columns: new[] { "id", "name", "display_name", "sort_order" },
                values: new object[,]
                {
                    { 1, "FP1", "Free Practice 1", 1 },
                    { 2, "FP2", "Free Practice 2", 2 },
                    { 3, "FP3", "Free Practice 3", 3 },
                    { 4, "Qualifying", "Qualifying", 4 },
                    { 5, "SprintQualifying", "Sprint Qualifying", 5 },
                    { 6, "Sprint", "Sprint", 6 },
                    { 7, "Race", "Race", 7 },
                }
            );

            // Seed Grand Prix (2026 season, 24 races)
            migrationBuilder.InsertData(
                table: "grand_prix",
                columns: new[] { "id", "name", "season", "sort_order" },
                values: new object[,]
                {
                    { 1, "Bahrain Grand Prix", 2026, 1 },
                    { 2, "Saudi Arabian Grand Prix", 2026, 2 },
                    { 3, "Australian Grand Prix", 2026, 3 },
                    { 4, "Japanese Grand Prix", 2026, 4 },
                    { 5, "Chinese Grand Prix", 2026, 5 },
                    { 6, "Miami Grand Prix", 2026, 6 },
                    { 7, "Emilia Romagna Grand Prix", 2026, 7 },
                    { 8, "Monaco Grand Prix", 2026, 8 },
                    { 9, "Spanish Grand Prix", 2026, 9 },
                    { 10, "Canadian Grand Prix", 2026, 10 },
                    { 11, "Austrian Grand Prix", 2026, 11 },
                    { 12, "British Grand Prix", 2026, 12 },
                    { 13, "Belgian Grand Prix", 2026, 13 },
                    { 14, "Hungarian Grand Prix", 2026, 14 },
                    { 15, "Dutch Grand Prix", 2026, 15 },
                    { 16, "Italian Grand Prix", 2026, 16 },
                    { 17, "Azerbaijan Grand Prix", 2026, 17 },
                    { 18, "Singapore Grand Prix", 2026, 18 },
                    { 19, "United States Grand Prix", 2026, 19 },
                    { 20, "Mexico City Grand Prix", 2026, 20 },
                    { 21, "Brazilian Grand Prix", 2026, 21 },
                    { 22, "Las Vegas Grand Prix", 2026, 22 },
                    { 23, "Qatar Grand Prix", 2026, 23 },
                    { 24, "Abu Dhabi Grand Prix", 2026, 24 },
                }
            );

            // Seed event pool entries
            // Race events (session_type_id = 7)
            migrationBuilder.InsertData(
                table: "event_pool_entries",
                columns: new[] { "id", "session_type_id", "event_key", "display_text" },
                values: new object[,]
                {
                    { 1, 7, "SAFETY_CAR", "Safety Car" },
                    { 2, 7, "VIRTUAL_SAFETY_CAR", "Virtual Safety Car" },
                    { 3, 7, "RED_FLAG", "Red Flag" },
                    { 4, 7, "FASTEST_LAP", "Fastest Lap" },
                    { 5, 7, "DRIVER_OF_THE_DAY", "Driver of the Day" },
                    { 6, 7, "PODIUM_FINISH", "Podium Finish" },
                    { 7, 7, "PIT_STOP_UNDER_3S", "Pit Stop Under 3s" },
                    { 8, 7, "DOUBLE_STACK", "Double Stack Pit Stop" },
                    { 9, 7, "OVERTAKE_FOR_LEAD", "Overtake for the Lead" },
                    { 10, 7, "DRS_OVERTAKE", "DRS Overtake" },
                    { 11, 7, "TEAM_RADIO_RAGE", "Angry Team Radio" },
                    { 12, 7, "PENALTY_ISSUED", "Penalty Issued" },
                    { 13, 7, "TRACK_LIMITS_WARNING", "Track Limits Warning" },
                    { 14, 7, "TYRE_BLOWOUT", "Tyre Blowout" },
                    { 15, 7, "RAIN_STARTS", "Rain Starts" },
                    { 16, 7, "FORMATION_LAP_DRAMA", "Formation Lap Drama" },
                    { 17, 7, "FIRST_LAP_INCIDENT", "First Lap Incident" },
                    { 18, 7, "RETIREMENT", "Retirement" },
                    { 19, 7, "BLUE_FLAGS_SHOWN", "Blue Flags Shown" },
                    { 20, 7, "ENGINE_FAILURE", "Engine Failure" },
                    { 21, 7, "COLLISION", "Collision" },
                    { 22, 7, "UNDERCUT_ATTEMPT", "Undercut Attempt" },
                    { 23, 7, "OVERCUT_ATTEMPT", "Overcut Attempt" },
                    { 24, 7, "WRONG_TYRE_FITTED", "Wrong Tyre Fitted" },
                    { 25, 7, "SLOW_PIT_STOP", "Slow Pit Stop (5s+)" },
                    { 26, 7, "CHEQUERED_FLAG", "Chequered Flag" },
                    { 27, 7, "LOCK_UP", "Lock Up" },
                    { 28, 7, "GRAVEL_EXCURSION", "Gravel Excursion" },
                    { 29, 7, "CHAMPIONSHIP_LEADER_CHANGE", "Championship Leader Changes" },
                    { 30, 7, "TEAM_ORDERS", "Team Orders Issued" },
                    { 31, 7, "STRATEGY_GAMBLE", "Strategy Gamble" },
                    { 32, 7, "DEBRIS_ON_TRACK", "Debris on Track" },
                    { 33, 7, "MEDICAL_CAR_DEPLOYED", "Medical Car Deployed" },
                    { 34, 7, "PHOTO_FINISH", "Photo Finish" },
                    { 35, 7, "LAPPED_CAR_UNLAPS", "Lapped Car Unlaps Itself" },
                }
            );

            // Qualifying events (session_type_id = 4)
            migrationBuilder.InsertData(
                table: "event_pool_entries",
                columns: new[] { "id", "session_type_id", "event_key", "display_text" },
                values: new object[,]
                {
                    { 36, 4, "POLE_POSITION", "Pole Position" },
                    { 37, 4, "RED_FLAG_Q", "Red Flag in Qualifying" },
                    { 38, 4, "TRACK_EVOLUTION", "Track Evolution Matters" },
                    { 39, 4, "Q1_KNOCKOUT", "Surprise Q1 Knockout" },
                    { 40, 4, "Q2_KNOCKOUT", "Surprise Q2 Knockout" },
                    { 41, 4, "TRAFFIC_DRAMA", "Traffic Drama" },
                    { 42, 4, "PURPLE_SECTOR", "Purple Sector" },
                    { 43, 4, "BANKER_LAP", "Banker Lap Mentioned" },
                    { 44, 4, "FINAL_FLYING_LAP", "Final Flying Lap Drama" },
                    { 45, 4, "FRONT_ROW_LOCKOUT", "Front Row Lockout" },
                    { 46, 4, "LAP_DELETED", "Lap Deleted (Track Limits)" },
                    { 47, 4, "MECHANICAL_ISSUE", "Mechanical Issue" },
                    { 48, 4, "CRASH_IN_QUALIFYING", "Crash in Qualifying" },
                    { 49, 4, "YELLOW_FLAG_DISRUPTION", "Yellow Flag Disruption" },
                    { 50, 4, "SLIPSTREAM_TOW", "Slipstream/Tow Used" },
                    { 51, 4, "TYRE_STRATEGY_SPLIT", "Tyre Strategy Split" },
                    { 52, 4, "TEAM_RADIO_FRUSTRATION", "Frustration on Team Radio" },
                    { 53, 4, "NEW_TRACK_RECORD", "New Track Record" },
                    { 54, 4, "GEAR_BOX_ISSUE", "Gearbox Issue" },
                    { 55, 4, "POWER_UNIT_CHANGE", "Power Unit Change" },
                    { 56, 4, "GRID_PENALTY_APPLIED", "Grid Penalty Applied" },
                    { 57, 4, "WEATHER_CHANGE", "Weather Change" },
                    { 58, 4, "SESSION_DELAYED", "Session Delayed" },
                    { 59, 4, "DRIVER_GOES_OFF", "Driver Goes Off Track" },
                    { 60, 4, "SANDBAGGING_ACCUSATION", "Sandbagging Mentioned" },
                    { 61, 4, "SPLIT_TIMES_TIGHT", "Split Times Within 0.1s" },
                    { 62, 4, "OUTLAP_ISSUES", "Outlap Issues" },
                    { 63, 4, "COOL_DOWN_LAP", "Cool-Down Lap Shown" },
                    { 64, 4, "SETUP_CHANGE", "Setup Change Mentioned" },
                    { 65, 4, "WING_ADJUSTMENT", "Wing Adjustment Shown" },
                    { 66, 4, "DRS_DETECTION_ISSUE", "DRS Detection Issue" },
                }
            );

            // Sprint events (session_type_id = 6)
            migrationBuilder.InsertData(
                table: "event_pool_entries",
                columns: new[] { "id", "session_type_id", "event_key", "display_text" },
                values: new object[,]
                {
                    { 67, 6, "SPRINT_SAFETY_CAR", "Safety Car in Sprint" },
                    { 68, 6, "SPRINT_FASTEST_LAP", "Sprint Fastest Lap" },
                    { 69, 6, "SPRINT_OVERTAKE_LEAD", "Overtake for Sprint Lead" },
                    { 70, 6, "SPRINT_DRS_PASS", "DRS Overtake in Sprint" },
                    { 71, 6, "SPRINT_CONTACT", "Contact in Sprint" },
                    { 72, 6, "SPRINT_RETIREMENT", "Retirement in Sprint" },
                    { 73, 6, "SPRINT_PENALTY", "Penalty in Sprint" },
                    { 74, 6, "SPRINT_FIRST_LAP", "First Lap Incident" },
                    { 75, 6, "SPRINT_TEAM_RADIO", "Team Radio in Sprint" },
                    { 76, 6, "SPRINT_STRATEGY", "Strategy Surprise in Sprint" },
                    { 77, 6, "SPRINT_TRACK_LIMITS", "Track Limits in Sprint" },
                    { 78, 6, "SPRINT_LOCK_UP", "Lock Up in Sprint" },
                    { 79, 6, "SPRINT_POSITION_SWAP", "Position Swap in Sprint" },
                    { 80, 6, "SPRINT_DEBRIS", "Debris in Sprint" },
                    { 81, 6, "SPRINT_BLUE_FLAGS", "Blue Flags in Sprint" },
                    { 82, 6, "SPRINT_VSC", "Virtual Safety Car in Sprint" },
                    { 83, 6, "SPRINT_RED_FLAG", "Red Flag in Sprint" },
                    { 84, 6, "SPRINT_TYRE_DEG", "Tyre Degradation Issues" },
                    { 85, 6, "SPRINT_PHOTO_FINISH", "Close Finish in Sprint" },
                    { 86, 6, "SPRINT_POINTS_CHANGE", "Championship Points Change" },
                    { 87, 6, "SPRINT_GRAVEL", "Gravel Excursion in Sprint" },
                    { 88, 6, "SPRINT_COLLISION", "Collision in Sprint" },
                    { 89, 6, "SPRINT_ENGINE_ISSUE", "Engine Issue in Sprint" },
                    { 90, 6, "SPRINT_TEAM_ORDERS", "Team Orders in Sprint" },
                    { 91, 6, "SPRINT_UNDERCUT", "Undercut in Sprint" },
                    { 92, 6, "SPRINT_FORMATION", "Formation Lap Issue" },
                    { 93, 6, "SPRINT_RAIN", "Rain in Sprint" },
                    { 94, 6, "SPRINT_WING_DAMAGE", "Wing Damage in Sprint" },
                    { 95, 6, "SPRINT_PIT_ERROR", "Pit Stop Error in Sprint" },
                    { 96, 6, "SPRINT_DOUBLE_STACK", "Double Stack in Sprint" },
                    { 97, 6, "SPRINT_CHECKERED", "Sprint Finish" },
                }
            );

            // Sprint Qualifying events (session_type_id = 5)
            migrationBuilder.InsertData(
                table: "event_pool_entries",
                columns: new[] { "id", "session_type_id", "event_key", "display_text" },
                values: new object[,]
                {
                    { 98, 5, "SQ_POLE", "Sprint Qualifying Pole" },
                    { 99, 5, "SQ_RED_FLAG", "Red Flag in Sprint Qualifying" },
                    { 100, 5, "SQ_SURPRISE_KNOCKOUT", "Surprise Knockout" },
                    { 101, 5, "SQ_TRAFFIC", "Traffic in Sprint Qualifying" },
                    { 102, 5, "SQ_PURPLE_SECTOR", "Purple Sector" },
                    { 103, 5, "SQ_LAP_DELETED", "Lap Deleted" },
                    { 104, 5, "SQ_CRASH", "Crash in Sprint Qualifying" },
                    { 105, 5, "SQ_YELLOW_FLAG", "Yellow Flag" },
                    { 106, 5, "SQ_SLIPSTREAM", "Slipstream Used" },
                    { 107, 5, "SQ_TEAM_RADIO", "Team Radio Drama" },
                    { 108, 5, "SQ_TRACK_RECORD", "Track Record Broken" },
                    { 109, 5, "SQ_WEATHER", "Weather Change" },
                    { 110, 5, "SQ_MECHANICAL", "Mechanical Issue" },
                    { 111, 5, "SQ_GRID_PENALTY", "Grid Penalty" },
                    { 112, 5, "SQ_TIGHT_MARGINS", "Margins Within 0.1s" },
                    { 113, 5, "SQ_OUTLAP_ISSUE", "Outlap Issue" },
                    { 114, 5, "SQ_FRONT_ROW", "Front Row Lockout" },
                    { 115, 5, "SQ_STRATEGY_SPLIT", "Strategy Split" },
                    { 116, 5, "SQ_DRIVER_ERROR", "Driver Error" },
                    { 117, 5, "SQ_SESSION_DELAY", "Session Delayed" },
                    { 118, 5, "SQ_SANDBAGGING", "Sandbagging Mentioned" },
                    { 119, 5, "SQ_WING_CHANGE", "Wing Change" },
                    { 120, 5, "SQ_SETUP_ISSUE", "Setup Issue" },
                    { 121, 5, "SQ_BANKER_LAP", "Banker Lap" },
                    { 122, 5, "SQ_FINAL_ATTEMPT", "Final Attempt Drama" },
                    { 123, 5, "SQ_DRS_ISSUE", "DRS Issue" },
                    { 124, 5, "SQ_GEAR_PROBLEM", "Gear Problem" },
                    { 125, 5, "SQ_TRACK_EVOLUTION", "Track Evolution" },
                    { 126, 5, "SQ_LOCKUP", "Lock Up" },
                    { 127, 5, "SQ_OFF_TRACK", "Goes Off Track" },
                    { 128, 5, "SQ_FRUSTRATION", "Driver Frustration" },
                }
            );

            // Practice events (session_type_id = 1, FP1; FP2/FP3 share this pool)
            migrationBuilder.InsertData(
                table: "event_pool_entries",
                columns: new[] { "id", "session_type_id", "event_key", "display_text" },
                values: new object[,]
                {
                    { 129, 1, "FP_RED_FLAG", "Red Flag in Practice" },
                    { 130, 1, "FP_FASTEST_TIME", "Fastest Time Set" },
                    { 131, 1, "FP_LONG_RUN", "Long Run Pace Analysis" },
                    { 132, 1, "FP_SHORT_RUN", "Short Run Mentioned" },
                    { 133, 1, "FP_TYRE_TEST", "Tyre Compound Test" },
                    { 134, 1, "FP_AERO_RAKE", "Aero Rake Spotted" },
                    { 135, 1, "FP_SPIN", "Spin in Practice" },
                    { 136, 1, "FP_CRASH", "Crash in Practice" },
                    { 137, 1, "FP_GEARBOX_ISSUE", "Gearbox Issue" },
                    { 138, 1, "FP_ENGINE_PROBLEM", "Engine Problem" },
                    { 139, 1, "FP_TRACK_LIMITS", "Track Limits Warning" },
                    { 140, 1, "FP_TEAM_RADIO", "Team Radio in Practice" },
                    { 141, 1, "FP_SETUP_CHANGE", "Setup Change" },
                    { 142, 1, "FP_TRAFFIC", "Traffic in Practice" },
                    { 143, 1, "FP_WEATHER_CHANGE", "Weather Change" },
                    { 144, 1, "FP_SESSION_DELAYED", "Session Delayed" },
                    { 145, 1, "FP_GRAVEL", "Gravel Excursion" },
                    { 146, 1, "FP_DEBRIS", "Debris on Track" },
                    { 147, 1, "FP_YELLOW_FLAG", "Yellow Flag" },
                    { 148, 1, "FP_DRS_TEST", "DRS Test" },
                    { 149, 1, "FP_RESERVE_DRIVER", "Reserve Driver Appearance" },
                    { 150, 1, "FP_NEW_PARTS", "New Parts Tested" },
                    { 151, 1, "FP_BRAKE_ISSUE", "Brake Issue" },
                    { 152, 1, "FP_HYDRAULIC_LEAK", "Hydraulic Leak" },
                    { 153, 1, "FP_FLOOR_DAMAGE", "Floor Damage" },
                    { 154, 1, "FP_WING_ADJUSTMENT", "Wing Adjustment" },
                    { 155, 1, "FP_COOLING_ISSUE", "Cooling Issue" },
                    { 156, 1, "FP_LOCK_UP", "Lock Up" },
                    { 157, 1, "FP_COMPARISON_SHOWN", "Comparison Data Shown" },
                    { 158, 1, "FP_SECTOR_ANALYSIS", "Sector Analysis" },
                    { 159, 1, "FP_PIT_PRACTICE", "Pit Stop Practice" },
                }
            );

            // Reset identity sequences to continue after seeded data
            migrationBuilder.Sql("SELECT setval('session_types_id_seq', 7);");
            migrationBuilder.Sql("SELECT setval('grand_prix_id_seq', 24);");
            migrationBuilder.Sql("SELECT setval('event_pool_entries_id_seq', 159);");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "event_pool_entries");

            migrationBuilder.DropTable(name: "grand_prix");

            migrationBuilder.DropTable(name: "session_types");
        }
    }
}
