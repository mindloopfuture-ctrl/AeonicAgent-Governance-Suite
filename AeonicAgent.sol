// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AeonicAgent
 * @notice Tesorería/módulo de autocorrección gobernado por un Gnosis Safe (guardian).
 *         Solo el guardian puede ejecutar la autocorrección. Guarda el CID "genético" vigente
 *         e historial mínimo de integridad.
 */
contract AeonicAgent {
    address public immutable guardian;          // Gnosis Safe
    string  public currentGeneticHash;          // CID/IPFS vigente
    uint256 public lastIntegrityScore;          // último score reportado
    uint256 public minIntegrityThreshold;       // umbral mínimo exigido para aceptar autocorrección

    event AutocorrectionExecuted(
        uint256 integrityScore,
        string newGeneticHash,
        address indexed executor,
        uint256 timestamp
    );

    event ThresholdUpdated(uint256 oldThreshold, uint256 newThreshold, address indexed executor);

    modifier onlyGuardian() {
        require(msg.sender == guardian, "Aeonic: not guardian");
        _;
    }

    constructor(address _guardian, string memory initialGeneticHash) {
        require(_guardian != address(0), "Aeonic: guardian zero");
        guardian = _guardian;
        currentGeneticHash = initialGeneticHash;
        minIntegrityThreshold = 80; // por defecto
    }

    function setMinIntegrityThreshold(uint256 newThreshold) external onlyGuardian {
        uint256 old = minIntegrityThreshold;
        minIntegrityThreshold = newThreshold;
        emit ThresholdUpdated(old, newThreshold, msg.sender);
    }

    /**
     * @dev Ejecuta autocorrección: actualiza el CID vigente tras auditorías.
     *      Debe ser llamado por el Gnosis Safe (guardian).
     */
    function executeAutocorrection(uint256 integrityScore, string calldata newGeneticHash) external onlyGuardian {
        require(bytes(newGeneticHash).length > 0, "Aeonic: empty CID");
        require(integrityScore >= minIntegrityThreshold, "Aeonic: integrity too low");

        lastIntegrityScore = integrityScore;
        currentGeneticHash = newGeneticHash;

        emit AutocorrectionExecuted(integrityScore, newGeneticHash, msg.sender, block.timestamp);
    }
}