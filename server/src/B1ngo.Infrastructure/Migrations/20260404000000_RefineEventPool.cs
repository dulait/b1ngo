using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace B1ngo.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RefineEventPool : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // ── Race pool: remove 8 events ──
            migrationBuilder.DeleteData(table: "event_pool_entries", keyColumn: "id", keyValue: 4); // Fastest Lap
            migrationBuilder.DeleteData(table: "event_pool_entries", keyColumn: "id", keyValue: 5); // Driver of the Day
            migrationBuilder.DeleteData(table: "event_pool_entries", keyColumn: "id", keyValue: 6); // Podium Finish
            migrationBuilder.DeleteData(table: "event_pool_entries", keyColumn: "id", keyValue: 11); // Angry Team Radio
            migrationBuilder.DeleteData(table: "event_pool_entries", keyColumn: "id", keyValue: 16); // Formation Lap Drama
            migrationBuilder.DeleteData(table: "event_pool_entries", keyColumn: "id", keyValue: 19); // Blue Flags Shown
            migrationBuilder.DeleteData(table: "event_pool_entries", keyColumn: "id", keyValue: 26); // Chequered Flag
            migrationBuilder.DeleteData(table: "event_pool_entries", keyColumn: "id", keyValue: 31); // Strategy Gamble

            // ── Qualifying pool: remove 5 events ──
            migrationBuilder.DeleteData(table: "event_pool_entries", keyColumn: "id", keyValue: 36); // Pole Position
            migrationBuilder.DeleteData(table: "event_pool_entries", keyColumn: "id", keyValue: 38); // Track Evolution Matters
            migrationBuilder.DeleteData(table: "event_pool_entries", keyColumn: "id", keyValue: 42); // Purple Sector
            migrationBuilder.DeleteData(table: "event_pool_entries", keyColumn: "id", keyValue: 52); // Frustration on Team Radio
            migrationBuilder.DeleteData(table: "event_pool_entries", keyColumn: "id", keyValue: 63); // Cool-Down Lap Shown

            // ── Sprint pool: remove 3 events ──
            migrationBuilder.DeleteData(table: "event_pool_entries", keyColumn: "id", keyValue: 68); // Sprint Fastest Lap
            migrationBuilder.DeleteData(table: "event_pool_entries", keyColumn: "id", keyValue: 75); // Team Radio in Sprint
            migrationBuilder.DeleteData(table: "event_pool_entries", keyColumn: "id", keyValue: 97); // Sprint Finish

            // ── Sprint Qualifying pool: remove 4 events ──
            migrationBuilder.DeleteData(table: "event_pool_entries", keyColumn: "id", keyValue: 98); // Sprint Qualifying Pole
            migrationBuilder.DeleteData(table: "event_pool_entries", keyColumn: "id", keyValue: 102); // Purple Sector
            migrationBuilder.DeleteData(table: "event_pool_entries", keyColumn: "id", keyValue: 107); // Team Radio Drama
            migrationBuilder.DeleteData(table: "event_pool_entries", keyColumn: "id", keyValue: 128); // Driver Frustration

            // ── Practice pool: remove 4 events ──
            migrationBuilder.DeleteData(table: "event_pool_entries", keyColumn: "id", keyValue: 130); // Fastest Time Set
            migrationBuilder.DeleteData(table: "event_pool_entries", keyColumn: "id", keyValue: 140); // Team Radio in Practice
            migrationBuilder.DeleteData(table: "event_pool_entries", keyColumn: "id", keyValue: 157); // Comparison Data Shown
            migrationBuilder.DeleteData(table: "event_pool_entries", keyColumn: "id", keyValue: 158); // Sector Analysis

            // ── Race pool: add 8 replacements (session_type_id = 7) ──
            migrationBuilder.InsertData(
                table: "event_pool_entries",
                columns: new[] { "session_type_id", "event_key", "display_text" },
                values: new object[,]
                {
                    { 7, "PIT_LANE_SPEEDING", "Pit Lane Speeding Penalty" },
                    { 7, "BLACK_AND_WHITE_FLAG", "Black and White Flag Shown" },
                    { 7, "DRIVER_GAINS_5_PLUS", "Driver Gains 5+ Positions" },
                    { 7, "THREE_PLUS_PIT_STOPS", "3+ Pit Stops by One Driver" },
                    { 7, "LEAD_CHANGE_FINAL_10", "Lead Change in Final 10 Laps" },
                    { 7, "SPIN", "Car Spins" },
                    { 7, "UNSAFE_RELEASE", "Unsafe Release" },
                    { 7, "FIVE_SECOND_PENALTY", "5-Second Time Penalty" },
                }
            );

            // ── Qualifying pool: add 5 replacements (session_type_id = 4) ──
            migrationBuilder.InsertData(
                table: "event_pool_entries",
                columns: new[] { "session_type_id", "event_key", "display_text" },
                values: new object[,]
                {
                    { 4, "IMPROVEMENT_ON_FINAL_RUN", "Pole Decided on Final Run" },
                    { 4, "ABORTED_LAP", "Aborted Flying Lap" },
                    { 4, "KNOCKED_OUT_BY_THOUSANDTHS", "Knockout by < 0.050s" },
                    { 4, "DOUBLE_YELLOW", "Double Yellow Flag" },
                    { 4, "Q3_ONLY_ONE_RUN", "Driver Does Only One Q3 Run" },
                }
            );

            // ── Sprint pool: add 3 replacements (session_type_id = 6) ──
            migrationBuilder.InsertData(
                table: "event_pool_entries",
                columns: new[] { "session_type_id", "event_key", "display_text" },
                values: new object[,]
                {
                    { 6, "SPRINT_UNSAFE_RELEASE", "Unsafe Release in Sprint" },
                    { 6, "SPRINT_SPIN", "Spin in Sprint" },
                    { 6, "SPRINT_POSITION_GAIN_3", "Driver Gains 3+ Positions in Sprint" },
                }
            );

            // ── Sprint Qualifying pool: add 4 replacements (session_type_id = 5) ──
            migrationBuilder.InsertData(
                table: "event_pool_entries",
                columns: new[] { "session_type_id", "event_key", "display_text" },
                values: new object[,]
                {
                    { 5, "SQ_ABORTED_LAP", "Aborted Lap in Sprint Qualifying" },
                    { 5, "SQ_IMPROVEMENT_FINAL_RUN", "Pole on Final Attempt" },
                    { 5, "SQ_DOUBLE_YELLOW", "Double Yellow Flag" },
                    { 5, "SQ_KNOCKOUT_THOUSANDTHS", "Knockout by < 0.050s" },
                }
            );

            // ── Practice pool: add 4 replacements (session_type_id = 1) ──
            migrationBuilder.InsertData(
                table: "event_pool_entries",
                columns: new[] { "session_type_id", "event_key", "display_text" },
                values: new object[,]
                {
                    { 1, "FP_FIRE", "Fire on Car" },
                    { 1, "FP_RESERVE_COMPETITIVE", "Reserve Driver Sets Competitive Time" },
                    { 1, "FP_SESSION_RED_CLOCK", "Session Clock Stopped" },
                    { 1, "FP_PORPOISING", "Porpoising / Bouncing Visible" },
                }
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // ── Remove replacement events ──

            // Race
            migrationBuilder.Sql(
                "DELETE FROM event_pool_entries WHERE event_key IN ('PIT_LANE_SPEEDING','BLACK_AND_WHITE_FLAG','DRIVER_GAINS_5_PLUS','THREE_PLUS_PIT_STOPS','LEAD_CHANGE_FINAL_10','SPIN','UNSAFE_RELEASE','FIVE_SECOND_PENALTY') AND session_type_id = 7;"
            );

            // Qualifying
            migrationBuilder.Sql(
                "DELETE FROM event_pool_entries WHERE event_key IN ('IMPROVEMENT_ON_FINAL_RUN','ABORTED_LAP','KNOCKED_OUT_BY_THOUSANDTHS','DOUBLE_YELLOW','Q3_ONLY_ONE_RUN') AND session_type_id = 4;"
            );

            // Sprint
            migrationBuilder.Sql(
                "DELETE FROM event_pool_entries WHERE event_key IN ('SPRINT_UNSAFE_RELEASE','SPRINT_SPIN','SPRINT_POSITION_GAIN_3') AND session_type_id = 6;"
            );

            // Sprint Qualifying
            migrationBuilder.Sql(
                "DELETE FROM event_pool_entries WHERE event_key IN ('SQ_ABORTED_LAP','SQ_IMPROVEMENT_FINAL_RUN','SQ_DOUBLE_YELLOW','SQ_KNOCKOUT_THOUSANDTHS') AND session_type_id = 5;"
            );

            // Practice
            migrationBuilder.Sql(
                "DELETE FROM event_pool_entries WHERE event_key IN ('FP_FIRE','FP_RESERVE_COMPETITIVE','FP_SESSION_RED_CLOCK','FP_PORPOISING') AND session_type_id = 1;"
            );

            // ── Restore removed events ──
            migrationBuilder.InsertData(
                table: "event_pool_entries",
                columns: new[] { "id", "session_type_id", "event_key", "display_text" },
                values: new object[,]
                {
                    // Race
                    { 4, 7, "FASTEST_LAP", "Fastest Lap" },
                    { 5, 7, "DRIVER_OF_THE_DAY", "Driver of the Day" },
                    { 6, 7, "PODIUM_FINISH", "Podium Finish" },
                    { 11, 7, "TEAM_RADIO_RAGE", "Angry Team Radio" },
                    { 16, 7, "FORMATION_LAP_DRAMA", "Formation Lap Drama" },
                    { 19, 7, "BLUE_FLAGS_SHOWN", "Blue Flags Shown" },
                    { 26, 7, "CHEQUERED_FLAG", "Chequered Flag" },
                    { 31, 7, "STRATEGY_GAMBLE", "Strategy Gamble" },
                    // Qualifying
                    { 36, 4, "POLE_POSITION", "Pole Position" },
                    { 38, 4, "TRACK_EVOLUTION", "Track Evolution Matters" },
                    { 42, 4, "PURPLE_SECTOR", "Purple Sector" },
                    { 52, 4, "TEAM_RADIO_FRUSTRATION", "Frustration on Team Radio" },
                    { 63, 4, "COOL_DOWN_LAP", "Cool-Down Lap Shown" },
                    // Sprint
                    { 68, 6, "SPRINT_FASTEST_LAP", "Sprint Fastest Lap" },
                    { 75, 6, "SPRINT_TEAM_RADIO", "Team Radio in Sprint" },
                    { 97, 6, "SPRINT_CHECKERED", "Sprint Finish" },
                    // Sprint Qualifying
                    { 98, 5, "SQ_POLE", "Sprint Qualifying Pole" },
                    { 102, 5, "SQ_PURPLE_SECTOR", "Purple Sector" },
                    { 107, 5, "SQ_TEAM_RADIO", "Team Radio Drama" },
                    { 128, 5, "SQ_FRUSTRATION", "Driver Frustration" },
                    // Practice
                    { 130, 1, "FP_FASTEST_TIME", "Fastest Time Set" },
                    { 140, 1, "FP_TEAM_RADIO", "Team Radio in Practice" },
                    { 157, 1, "FP_COMPARISON_SHOWN", "Comparison Data Shown" },
                    { 158, 1, "FP_SECTOR_ANALYSIS", "Sector Analysis" },
                }
            );
        }
    }
}
